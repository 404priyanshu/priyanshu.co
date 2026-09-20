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
  return (
    <figure className="bv-visual bv-tradeoff">
      <svg viewBox="0 0 720 390" role="img" aria-labelledby="tradeoff-title tradeoff-description">
        <title id="tradeoff-title">Bias-variance tradeoff across model complexity</title>
        <desc id="tradeoff-description">
          Bias falls and variance rises as model complexity increases. Their combination produces a U-shaped test-error
          curve with a sweet spot near the middle.
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
          d="M88 90 C188 112 282 154 370 219 C460 270 555 289 650 296"
        />
        <path
          className="bv-tradeoff__path bv-tradeoff__path--variance"
          d="M88 295 C193 289 286 270 370 222 C470 164 548 108 650 86"
        />
        <path
          className="bv-tradeoff__path bv-tradeoff__path--error"
          d="M88 158 C205 258 300 282 370 272 C463 259 548 211 650 132"
        />

        <line className="bv-tradeoff__sweet-line" x1="370" y1="75" x2="370" y2="318" />
        <circle className="bv-tradeoff__marker" cx="370" cy="272" r="7" />

        <g className="bv-tradeoff__labels">
          <text x="111" y="100" className="bv-tradeoff__label--bias">
            Bias²
          </text>
          <text x="567" y="103" className="bv-tradeoff__label--variance">
            Variance
          </text>
          <text x="533" y="194" className="bv-tradeoff__label--error">
            Test error
          </text>
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
        More flexibility usually trades systematic error for sensitivity. Validation performance tells you where to
        stop.
      </figcaption>
    </figure>
  )
}
