'use client'

import { useEffect, useRef, useState } from 'react'

export function BiasVarianceEquation() {
  return (
    <figure className="bv-equation">
      <div
        className="bv-equation__row"
        aria-label="Expected squared test error equals squared bias plus variance plus irreducible noise"
      >
        <span className="bv-equation__lhs">E[(y − f̂(x))²]</span>
        <span aria-hidden="true" className="bv-equation__operator">
          =
        </span>
        <span className="bv-equation__term">
          <span>(Bias[f̂(x)])²</span>
          <small>wrong on average</small>
        </span>
        <span aria-hidden="true" className="bv-equation__operator">
          +
        </span>
        <span className="bv-equation__term">
          <span>Var[f̂(x)]</span>
          <small>unstable</small>
        </span>
        <span aria-hidden="true" className="bv-equation__operator">
          +
        </span>
        <span className="bv-equation__term">
          <span>σ²</span>
          <small>irreducible noise</small>
        </span>
      </div>
    </figure>
  )
}

export function BiasVarianceTradeoff() {
  const figureRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [replay, setReplay] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(figureRef.current)
    return () => observer.disconnect()
  }, [])

  // All curves share one scale: test error is exactly bias² + variance + noise.
  const curve = (value) =>
    Array.from({ length: 101 }, (_, index) => {
      const t = index / 100
      return `${index ? 'L' : 'M'}${88 + 562 * t} ${318 - 280 * value(t)}`
    }).join(' ')

  return (
    <figure ref={figureRef} className="bv-visual bv-tradeoff" data-playing={playing}>
      <div className="bv-tradeoff__legend" aria-label="Graph legend">
        <span style={{ '--curve-color': '#6259c7' }}>Bias²</span>
        <span style={{ '--curve-color': '#b94721' }}>Variance</span>
        <span style={{ '--curve-color': '#18181b' }}>Test error</span>
        <button
          type="button"
          onClick={() => {
            setPlaying(true)
            setReplay((value) => value + 1)
          }}
        >
          Replay
        </button>
      </div>
      <svg key={replay} viewBox="0 0 720 390" role="img" aria-labelledby="tradeoff-title tradeoff-description">
        <title id="tradeoff-title">Bias-variance tradeoff across model complexity</title>
        <desc id="tradeoff-description">
          Bias falls and variance rises as model complexity increases. Their combination produces a U-shaped test-error
          curve with a minimum near the middle. This schematic uses test error equal to squared bias plus variance plus
          a constant noise floor. It is an illustration, not measured data.
        </desc>

        <g className="bv-tradeoff__grid" aria-hidden="true">
          <line x1="76" y1="70" x2="76" y2="318" />
          <line x1="76" y1="318" x2="664" y2="318" />
          <line x1="76" y1="236" x2="664" y2="236" />
          <line x1="76" y1="154" x2="664" y2="154" />
          <line x1="76" y1="72" x2="664" y2="72" />
        </g>

        <path
          className="bv-tradeoff__path bv-tradeoff__path--bias"
          pathLength="1"
          d={curve((t) => 0.65 * (1 - t) ** 2)}
        />
        <path
          className="bv-tradeoff__path bv-tradeoff__path--variance"
          pathLength="1"
          d={curve((t) => 0.65 * t ** 2)}
        />
        <path
          className="bv-tradeoff__path bv-tradeoff__path--error"
          pathLength="1"
          d={curve((t) => 0.65 * ((1 - t) ** 2 + t ** 2) + 0.1)}
        />

        <line className="bv-tradeoff__sweet-line" x1="369" y1="75" x2="369" y2="318" />
        <circle className="bv-tradeoff__marker" cx="369" cy="199" r="7" />

        <g className="bv-tradeoff__labels">
          <text x="370" y="54" textAnchor="middle" className="bv-tradeoff__label--sweet">
            sweet spot
          </text>
          <text x="370" y="356" textAnchor="middle">
            Model complexity →
          </text>
          <text transform="translate(28 196) rotate(-90)" textAnchor="middle">
            Expected error →
          </text>
        </g>
      </svg>
      <figcaption>
        An illustrative tradeoff, not measured results. The black curve adds the other two curves and a constant noise
        floor. Its lowest point is the best balance in this example.
      </figcaption>
    </figure>
  )
}
