---
title: 'Why LLM Servers Are Splitting Prefill From Decode'
date: '2026-10-12'
description:
  'Reading a prompt and writing a reply stress a GPU in opposite ways. The arithmetic behind disaggregated serving, the
  KV cache handoff it depends on, and when to skip it.'
---

Every reply you get from a language model is two different jobs pretending to be one.

First the server reads your whole prompt. Then it writes the answer, one token at a time. For years the standard way to
serve a model was to run both jobs on the same GPUs, interleaved, and hope they got along.

They don't, really. So the serving stacks are splitting them up. vLLM ships prefill/decode disaggregation behind a
connector, [llm-d](https://llm-d.ai) and [NVIDIA Dynamo](https://github.com/ai-dynamo/dynamo) are built around it, and
at the end of September the vLLM team published a
[practical guide to taking `vllm serve` apart](https://vllm-project.github.io/2026/09/29/disaggregated-serving-guide.html)
with real measurements.

I wanted to understand why this works, not just how to switch it on. It turns out most of the answer fits on the back of
an envelope.

## Two jobs hiding in one request

**Prefill** processes the prompt. All of its tokens are known up front, so the model can push them through every layer
in parallel. Along the way it computes a key and a value vector for each token in each layer and stores them. That
stored state is the **KV cache**. Prefill decides your **time to first token** (TTFT).

**Decode** generates the reply. Each new token depends on the one before it, so it runs one step at a time. Each step
pushes a single token per request through the whole model, and the attention layers read that request's entire KV cache
to do it. Then the new token's keys and values are appended to the cache, ready for the next step. Decode decides the
**inter-token latency** (ITL): the gap between words as they stream in.

Same model, same weights, same GPU. Very different workloads.

## The back of the envelope

The useful number here is **arithmetic intensity**: how many floating-point operations you do for each byte you read
from memory. Every GPU has a break-even point. Below it, you're waiting on memory. Above it, you're waiting on the math
units.

An H100 SXM does about 989 trillion dense BF16 operations per second and reads about 3.35 TB per second from HBM. Divide
one by the other and you get roughly **295 FLOPs per byte**. That's the line.

Now take Llama 3.1 70B in BF16. The weights are about 140 GB, and a forward pass costs about two FLOPs per parameter per
token. (I'm ignoring attention's own math here. It doesn't change the picture.)

| Phase                     | Weights read | Work                          | FLOPs per byte |
| ------------------------- | ------------ | ----------------------------- | -------------- |
| Prefill, 10,000 tokens    | ~140 GB once | 2 × 70B × 10,000 ≈ 1.4 × 10¹⁵ | ~10,000        |
| Decode step, batch of _B_ | ~140 GB once | 2 × 70B × _B_                 | ~_B_           |

Prefill sits miles above the line. The weights are read once and reused for ten thousand tokens, so the GPU is busy
doing math. It's **compute-bound**.

A decode step does one token per request. Even with 64 requests batched together, it does about 64 FLOPs per byte, a
fifth of what the GPU could handle. It's **memory-bandwidth-bound**. Batching more requests helps with the weights, but
not with the KV cache: every request has its own cache, so nothing is shared, and attention over it stays at a handful
of FLOPs per byte however large the batch gets.

So one phase wants as many FLOPs as possible, and the other wants as much memory bandwidth as possible. One wants to
finish a big chunk of work quickly. The other wants small steps at a steady, predictable rhythm.

## What goes wrong on a shared GPU

Picture a GPU halfway through streaming replies to thirty people. A new request arrives with a 10,000-token prompt. Its
prefill is a big, compute-heavy job, and while it runs, every one of those thirty streams waits. To each of those users,
the reply just stops for a moment.

The vLLM guide measured this on two L40S GPUs serving Qwen2.5-7B with prompts of about 8,000 tokens. With both phases
sharing the GPUs, p99 inter-token latency went from 23 ms to 169 ms at just 0.4 requests per second, and to 263 ms at 2
requests per second. With prefill and decode on separate GPUs, p99 stayed between 25 and 52 ms. Up to 1 request per
second, the median sat at 21–24 ms in both setups. That's exactly why this kind of problem hides: averages look fine
while the tail stutters.

There is a well-known fix that doesn't split anything: **chunked prefill**. Instead of running a long prompt in one go,
the scheduler cuts it into slices and mixes them into the same batches as ongoing decode steps.
[Sarathi-Serve](https://www.usenix.org/conference/osdi24/presentation/agrawal) made the case for it, and vLLM's V1
engine [turns it on by default](https://docs.vllm.ai/en/latest/usage/v1_guide/). It softens the stalls a lot.

But both phases still share one GPU, one batch budget, and one parallelism setup. Give prefill a bigger slice and decode
gets jumpier. Give decode a bigger slice and the first token takes longer. You're tuning one dial for two jobs that want
it turned in opposite directions.

## Two stations and a rail

[DistServe](https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin), from OSDI 2024, takes the other route:
run prefill and decode on different GPUs and move the KV cache between them. Each pool can then be sized and
parallelised for its own job. The paper reports up to 7.4× more requests served, or 12.6× tighter latency targets, while
keeping more than 90% of requests within their limits.

Here's that idea as a machine:

<ArticleFigure
  src="/assets/writing/splitting-prefill-and-decode/prefill-decode-bench.svg"
  alt="An animated isometric workbench with two stations joined by a rail. On the left, a hydraulic press comes down once and fills a tray with eight pairs of white key and value tiles: prefill. The carriage then carries the tray along the rail to the right-hand station: the KV cache handoff. There, a gantry sweeps a read bar over every tile in the tray, and after each sweep one new pair of dark tiles appears at the end: decode, one token per sweep. The tiles then clear and the empty tray returns for the next request."
  caption="Eight prompt tokens, four generated. Each tile pair is one token's keys and values: 320 KiB for Llama 3.1 70B in BF16. The press fills every prompt slot in one stroke, while the gantry has to sweep the whole tray once for every new token."
  width="680"
  height="420"
/>

The press is prefill: one heavy stroke, every prompt slot filled at once. The rail is the handoff. The gantry is decode,
and its sweep is the expensive part: before it can add a token, it reads everything already in the tray. As the tray
fills, every sweep gets a little longer.

## The handoff is the whole trick

The split only pays off if moving the cache is cheap compared to what you gain, so it's worth knowing how big the cache
actually is. For a standard transformer, it's easy to work out:

```js
// Llama 3.1 70B: 80 layers, 8 KV heads (grouped-query attention), 128 dims per head, BF16
const layers = 80
const kvHeads = 8
const headDim = 128
const bytesPerValue = 2

const bytesPerToken = 2 * layers * kvHeads * headDim * bytesPerValue // keys and values
// 327,680 bytes, or 320 KiB per token
```

A 10,000-token prompt therefore hands decode about 3.3 GB. Over a 400 Gb/s RDMA link, that's around 66 ms before any
overhead. The prefill that produced it was about 1.4 × 10¹⁵ FLOPs, which takes longer than that even at perfect
utilisation on a full node of eight H100s. On good hardware the transfer is a modest tax.

On bad hardware it's the whole bill. The two L40S cards in the vLLM test had no peer-to-peer path between them, so each
prompt's roughly 470 MB of cache took about 1.3 seconds to arrive. Median time to first token went from 0.7 s with both
phases on the same GPUs to 2.2 s split. The stutter was gone, but every reply started late. Before you benchmark
anything, the guide suggests checking `nvidia-smi topo -p2p r` and making sure the GPUs report `OK` to each other.

Grouped-query attention is part of why this is practical at all. With 64 query heads but only 8 KV heads, Llama 3.1
70B's cache is an eighth of what full multi-head attention would need. Model architecture and serving architecture turn
out to be the same conversation.

## What it looks like in vLLM

The guide's minimal setup is two `vllm serve` processes, one per GPU, connected with NVIDIA's NIXL transfer library. The
prefiller produces KV blocks and the decoder consumes them:

```bash
# Prefill instance, GPU 0
CUDA_VISIBLE_DEVICES=0 UCX_NET_DEVICES=all VLLM_NIXL_SIDE_CHANNEL_PORT=5600 \
  vllm serve Qwen/Qwen3-0.6B --port 8100 \
  --kv-transfer-config '{"kv_connector":"NixlConnector","kv_role":"kv_producer"}'

# Decode instance, GPU 1
CUDA_VISIBLE_DEVICES=1 UCX_NET_DEVICES=all VLLM_NIXL_SIDE_CHANNEL_PORT=5601 \
  vllm serve Qwen/Qwen3-0.6B --port 8200 \
  --kv-transfer-config '{"kv_connector":"NixlConnector","kv_role":"kv_consumer"}'
```

A small proxy sits in front and makes each request a two-step relay:

1. Send the request to the prefiller with `max_tokens: 1` and `kv_transfer_params: { "do_remote_decode": true }`. It
   runs the prompt, holds the KV blocks, and returns a description of where they are.
2. Forward the original request to the decoder with those `kv_transfer_params` attached. The decoder pulls the blocks
   over NIXL and starts generating.

The proxy in the vLLM repository is explicitly a development example. For production, the guide points to llm-d and
Dynamo, which add the routing, scheduling and failure handling. That last part matters: a split setup has a new way to
fail. If the decoder can't fetch its blocks, the default is to fail the request. You can choose to recompute the cache
instead, which is slower but keeps the request alive.

Also, a 0.6B model is only for checking the wiring. It's far too small to show any benefit.

## When it's not worth it

Splitting turns one service into three or four, and adds a network path that every request depends on. The guide is
refreshingly blunt that collocation is still the right answer for many deployments. Stay collocated when:

- **Time to first token is your tightest limit.** The transfer lands on every first token.
- **Your interconnect is slow.** No RDMA between nodes, or no NVLink or peer-to-peer within one, and the handoff eats
  your gains.
- **Traffic is low, bursty, or not latency-sensitive.** There's no tail to fix.

It earns its place when p99 inter-token latency misses its target under load, prompts are long, concurrency is high, and
the hardware can move gigabytes in tens of milliseconds. Chat and agent loops can benefit too, but they need extra care.
A follow-up turn shares most of its prompt with the last one, and newer setups move that cache back to prefill instead
of computing it again.

## The pattern underneath

What I like about this idea is that it isn't really about LLMs. It's the same move as putting a cache in front of a
database, or separating reads from writes. When one service does two jobs with opposite bottlenecks, it can't tune for
both. Split the jobs, then make the thing passing between them as cheap to move as possible.

For language models, the thing passing between them is the KV cache. At 320 KiB per token, how cheaply you can move it
decides whether this is a good idea at all.
