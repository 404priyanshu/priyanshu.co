---
title: 'Bias and Variance: Two Ways a Model Can Be Wrong'
date: '2026-09-20'
description:
  'A visual guide to underfitting, overfitting, the bias–variance decomposition, and what train and validation errors
  reveal about a model.'
---

A model can fail in two fundamentally different ways. It can be **consistently wrong**, because its assumptions are too
rigid, or **unreliably right**, because small changes in its training data produce large changes in its predictions.

These are bias and variance. Understanding the difference turns “the model performs badly” into a diagnosis you can act
on.

## Start with the target

Imagine repeating the same experiment: sample a new training set, fit the model, and make a prediction for the same
input. Each purple dot below is the result of one fitted model. The bullseye is the true value we want to predict.

<ArticleFigure
  src="/assets/bias-variance-target-analogy.svg"
  alt="Four animated targets comparing low and high bias with low and high variance"
  caption="Each purple dot is a model trained on a different sample. The orange ring is the true target."
  width="680"
  height="440"
/>

The two dimensions are independent:

- **Bias asks where the centre of the shots lands.** If their average is far from the bullseye, the learning procedure
  is systematically wrong.
- **Variance asks how far the shots spread.** A wide cloud means the fitted model depends heavily on which examples
  happened to appear in the training set.

The best case is the top-left target: predictions are centred on the truth and tightly grouped. The bottom-right is the
worst of both worlds: the models disagree with one another and are wrong on average.

## Bias is error from assumptions

Bias appears when a model is not flexible enough to represent the real relationship between inputs and outcomes. A
straight line fitted to a strongly curved pattern is the classic example. Even with an enormous training set, the line
cannot bend.

That is why high bias is associated with **underfitting**. The model leaves useful structure unexplained, so training
error is high and validation error is usually high as well.

Common sources include:

- a model class that is too simple;
- features that omit important information;
- regularization that is too strong;
- optimization that stops before the model has learned the available signal.

More data can make the estimate of the same inadequate model more precise, but it cannot remove a restriction built into
the model itself.

## Variance is error from sensitivity

Variance appears when a model follows the details of its training sample too closely. A deep decision tree might split
on a few unusual observations. A high-degree polynomial might twist to pass through nearly every point. Change the
sample slightly and those choices change too.

That is **overfitting**: training error is very low, but error rises on unseen data. The model has learned both signal
and sample-specific noise.

High variance is encouraged by:

- a very flexible model relative to the amount of data;
- noisy, redundant, or high-dimensional features;
- weak regularization;
- unstable fitting procedures.

Unlike bias, variance often _does_ improve with more representative data. Every additional example makes it harder for
an accidental quirk to control the fitted model.

## The decomposition

For squared-error regression, expected test error at an input \(x\) separates into three terms:

<BiasVarianceEquation />

The expectation is over all the training sets we might have sampled and over the noise in a new observation. The
decomposition tells us that prediction error has three sources, not one.

To see where it comes from, write the data-generating process as \(y = f(x) + ε\), where \(E[ε] = 0\) and \(Var[ε] =
σ²\). Then add and subtract the average prediction \(E[f̂(x)]\):

```text
y − f̂(x) = [f(x) − E[f̂(x)]] + [E[f̂(x)] − f̂(x)] + ε
```

Square both sides and take expectations. The cross-terms disappear: the noise has mean zero, and the fitted model's
deviation from its own average also has mean zero. What remains is squared bias, variance, and noise.

The last term matters. **Irreducible noise** is randomness or missing information no model can predict from the
available inputs. A better model can reduce bias or variance, but it cannot push expected test error below this noise
floor.

## Why there is a tradeoff

Increasing model complexity—deeper trees, higher polynomial degree, more parameters—usually gives the model more ways to
match the underlying signal. Bias falls. But that same freedom gives it more ways to follow accidental patterns in the
sample. Variance rises.

<BiasVarianceTradeoff />

The useful quantity is not either curve in isolation. It is their sum, plus irreducible noise. In the classical picture,
that sum is U-shaped: a simple model underfits on the left, a complex model overfits on the right, and the best expected
generalization lies somewhere between them.

This curve is a mental model, not a universal law. Modern over-parameterized systems can show phenomena such as double
descent. The operational lesson still survives: choose complexity by performance on data the model did not train on.

## Diagnose the problem from errors

Compare training performance with validation performance. The **level** of training error and the **gap** between the
two curves answer different questions.

| Pattern                                               | Likely diagnosis        | What it means                                            |
| ----------------------------------------------------- | ----------------------- | -------------------------------------------------------- |
| High training error, high validation error, small gap | High bias               | The model cannot fit even the training signal            |
| Low training error, much higher validation error      | High variance           | The model fits the sample but does not generalize        |
| Low training error, low validation error, small gap   | Good fit                | The learned pattern transfers to unseen data             |
| Both errors remain high after reasonable changes      | Noise or missing signal | The inputs may not contain enough predictive information |

Learning curves add another clue. If validation error keeps improving as the training set grows, collecting more data
may reduce variance. If both curves flatten at a similarly poor value, more examples alone are unlikely to fix the
model's bias.

Always make this comparison on a validation set that reflects deployment. A distribution mismatch can look like variance
even when the deeper problem is that training and production represent different worlds.

## What moves each term

For a **high-bias** model, increase its ability to learn signal:

- use a more expressive model or add interactions;
- engineer features that expose relevant structure;
- reduce regularization;
- train longer or improve optimization;
- revisit labels and the problem formulation.

For a **high-variance** model, make the learned solution more stable:

- collect more representative training examples;
- strengthen regularization or simplify the model;
- remove noisy features or reduce dimensionality;
- use bagging or an ensemble that averages unstable fits;
- use cross-validation to tune complexity rather than trusting one split.

Some interventions affect both terms. Better features can lower bias without a large variance penalty. Bagging can lower
variance while preserving the expressiveness of individual models. Regularization deliberately adds a little bias when
the reduction in variance is larger.

## Keep the mental model simple

When a model disappoints, ask two questions:

1. **Is it wrong in the same direction across plausible training sets?** That is bias.
2. **Would a different sample produce a meaningfully different model?** That is variance.

Bias is about the centre of the predictions. Variance is about their spread. Generalization depends on controlling both,
and validation data is how we find the balance we cannot observe from training error alone.
