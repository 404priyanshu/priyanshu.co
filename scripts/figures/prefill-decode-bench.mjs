// Fig 1 for the post "Why LLM Servers Are Splitting Prefill From Decode": a two-station bench.
// A press stamps the whole prompt into a KV tray at once (prefill), the tray rides a rail
// to the decode station (the KV handoff), and a gantry rescans the tray once per new token (decode).
//
// Built with the anatomy kit (the `anatomy` Claude Code skill), which is not part of this repo.
// It is loaded from ~/.claude/skills/anatomy/kit, or from the directory in ANATOMY_KIT.
//
//   node scripts/figures/prefill-decode-bench.mjs                      # rewrites the post's SVG
//   node scripts/figures/prefill-decode-bench.mjs --preview out.html   # also writes a preview page
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const kitDirectory = process.env.ANATOMY_KIT || join(homedir(), '.claude', 'skills', 'anatomy', 'kit')
const k = await import(pathToFileURL(join(kitDirectory, 'iso-kit.mjs')).href)

const { values } = parseArgs({
  options: {
    out: {
      type: 'string',
      default: join(
        rootDirectory,
        'public',
        'assets',
        'writing',
        'splitting-prefill-and-decode',
        'prefill-decode-bench.svg'
      )
    },
    preview: { type: 'string' }
  },
  strict: true
})
const OUT_SVG = resolve(values.out)

const WIDTH = 680
const HEIGHT = 420

// --- model -------------------------------------------------------------------------------
// Llama-3.1-70B, BF16: 80 layers x 8 KV heads x 128 dims x 2 (K and V) x 2 bytes = 327,680 B = 320 KiB per token.
const KIB_PER_TOKEN = (80 * 8 * 128 * 2 * 2) / 1024
const PROMPT = 8
const GENERATED = 4
const SLOTS = PROMPT + GENERATED
const mib = (tokens) => {
  const value = (tokens * KIB_PER_TOKEN) / 1024
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/0$/, '')
}

// --- world -------------------------------------------------------------------------------
const PLATE = { x: -182, y: -60, w: 364, d: 120, r: 8 }
const PLATE_H = 12
const FOOT_H = 5

const X_P = -100 // press centre
const X_D = 86 // decode station centre (carriage stop)

const CARRIAGE = { x: -46, y: -22, w: 92, d: 44, r: 3 }
const CAR_Z = 3
const CAR_TOP = 8
const TRAY = { x: -41, y: -17, w: 82, d: 34, r: 2 }
const TRAY_TOP = 11
const TILE_W = 5.6
const TILE_GAP = 0.8
const TILE_H = 2.6
const TILE_X0 = -38
const ROWS = [
  { y: -14, d: 12 }, // K row
  { y: 2, d: 12 } // V row
]
const slotX = (i) => TILE_X0 + i * (TILE_W + TILE_GAP)

// Press
const COL_TOP = 96
const HEAD = { x: X_P - 14, y: -52, w: 28, d: 68, r: 3 }
const HEAD_H = 12
const CYL_R = 9
const CYL_Z = 58
const PLATEN = { x: X_P - 43, y: -19, w: 86, d: 38, r: 2 }
const PLATEN_Z = 44
const PLATEN_H = 6
const RAM_DROP = PLATEN_Z - (TRAY_TOP + TILE_H + 0.2)

// Decode gantry
const RAIL_Y = 34
const G_RAIL = { x: X_D - 62, w: 124 }
const G_RAIL_Z = 14
const G_RAIL_H = 4
const PARK = X_D + 52
const UP_TOP = 52
const BAR_Z = 17

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [X_P, -42, COL_TOP + HEAD_H + 6],
    [X_P, 42, COL_TOP + HEAD_H + 6],
    [PARK, -40, UP_TOP + 8],
    [PARK, 40, UP_TOP + 8]
  ],
  WIDTH,
  HEIGHT,
  { pad: 40, azimuth: 66, elevation: 32 }
)

const at = (point) => k.iso(point, P)
const S = (paths, style) => k.solidSvg(paths, style)
const L = (d, style) => k.lineSvg(d, style)
const D = (points, style) => k.dotsSvg(points, style)
const depth = ([x, y, z = 0]) => k.depthOf([x, y, z], P)
const byDepth = (points) => [...points].sort((a, b) => depth(a) - depth(b))
const shift = (dx, dy = 0, dz = 0) => {
  const [sx, sy] = k.axisVector(P, [dx, dy, dz])
  return [Number(sx.toFixed(2)), Number(sy.toFixed(2))]
}

// --- base --------------------------------------------------------------------------------
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`]
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: 'lo' }))
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: 'mid' }))
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: 'lo' }))
  const screws = k.corners(PLATE, 10)
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(''), { tone: 'lo' }))
  out.push(
    D(
      screws.map(([x, y]) => at([x, y, 0])),
      { size: 0.5 }
    )
  )

  // Ruler strip along the front edge: the rail's travel, one tick per 4 units.
  const strip = { x: -162, y: PLATE.y + PLATE.d - 15, w: 324, d: 7, r: 1 }
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }))
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }))

  // Label plate at the back, between the stations.
  const label = { x: -30, y: -52, w: 60, d: 14, r: 1.5 }
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: 'lo', crease: 'none' }))
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: 'faint' }))
  out.push(
    L(k.lineOnTop([label.x + 6, label.y + 4.6], [label.x + 40, label.y + 4.6], 0.8, P), { tone: 'lo', free: true })
  )
  out.push(
    L(k.lineOnTop([label.x + 6, label.y + 7.2], [label.x + 48, label.y + 7.2], 0.8, P), { tone: 'lo', free: true })
  )
  out.push(
    L(k.lineOnTop([label.x + 6, label.y + 9.8], [label.x + 30, label.y + 9.8], 0.8, P), { tone: 'lo', free: true })
  )
  out.push(D([at([label.x + 3, label.y + 7, 0.8]), at([label.x + label.w - 3, label.y + 7, 0.8])], { size: 0.45 }))
  return out.join('')
}

// --- carriage rails ----------------------------------------------------------------------
const RAIL_FROM = -164
const RAIL_TO = 164
function rails() {
  const out = []
  for (const y of [-13, 8]) {
    out.push(S(k.slabOf({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: 'mid' }))
    out.push(
      D(
        [-140, -60, 0, 60, 140].map((x) => at([x, y + 2.5, 3])),
        { size: 0.4 }
      )
    )
  }
  for (const x of [RAIL_FROM - 5, RAIL_TO]) {
    out.push(S(k.slabOf({ x, y: -16, w: 5, d: 32, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: 'mid' }))
    out.push(D([at([x + 2.5, -11, 7]), at([x + 2.5, 11, 7])], { size: 0.45 }))
  }
  return out.join('')
}

// --- carriage and KV tray (built at x = 0) -------------------------------------------------
function tile(i, row, lit) {
  const plan = { x: slotX(i), y: row.y, w: TILE_W, d: row.d, r: 0.8 }
  return S(
    k.slabOf(plan, TRAY_TOP, TILE_H, P, 2, 0.3),
    lit ? { tone: 'hi', crease: 'lo', className: 'kv-new' } : { tone: 'hi', crease: 'lo' }
  )
}

function carriage() {
  const out = [
    `<path class="iso-halo" d="${k.haloOf(k.insetPlan(CARRIAGE, 4), CAR_Z, 0.1, P)}" style="filter:blur(4px)"/>`
  ]
  // Bushings riding the rails
  for (const [x, y] of byDepth([
    [-36, -15.5],
    [36, -15.5],
    [-36, 5.5],
    [36, 5.5]
  ])) {
    out.push(S(k.slabOf({ x: x - 6, y, w: 12, d: 10, r: 1.2 }, CAR_Z - 0.4, 2, P, 3), { tone: 'mid', crease: 'none' }))
  }
  out.push(S(k.slabOf(CARRIAGE, CAR_Z, CAR_TOP - CAR_Z, P, 5, 0.6), { tone: 'mid' }))
  out.push(
    D(
      [-40, -20, 20, 40].map((x) => at([x, CARRIAGE.y + CARRIAGE.d - 2.4, CAR_TOP])),
      { size: 0.4, tone: 'lo' }
    )
  )
  out.push(
    D(
      [-40, -20, 20, 40].map((x) => at([x, CARRIAGE.y + 2.4, CAR_TOP])),
      { size: 0.4, tone: 'lo' }
    )
  )
  // Handle on the front face
  const hx = 30
  out.push(
    S(k.slabOf({ x: hx - 2, y: CARRIAGE.y + CARRIAGE.d - 1, w: 4, d: 4, r: 1 }, CAR_Z + 1, 3, P, 2), {
      tone: 'mid',
      crease: 'none'
    })
  )
  out.push(S(k.cylinder(hx, CARRIAGE.y + CARRIAGE.d + 4, 3, CAR_Z, 5, P, 20), { tone: 'mid' }))
  out.push(L(k.knurl(hx, CARRIAGE.y + CARRIAGE.d + 4, 3, CAR_Z, CAR_Z + 5, 18, P), { tone: 'lo' }))
  // Tray
  out.push(S(k.slabOf(TRAY, CAR_TOP, TRAY_TOP - CAR_TOP, P, 4, 0.5), { tone: 'mid' }))
  out.push(L(k.lineOnTop([TRAY.x, 0], [TRAY.x + TRAY.w, 0], TRAY_TOP, P), { tone: 'faint' }))
  out.push(
    D(
      [
        at([TRAY.x + 1.6, TRAY.y + 1.6, TRAY_TOP]),
        at([TRAY.x + TRAY.w - 1.6, TRAY.y + 1.6, TRAY_TOP]),
        at([TRAY.x + 1.6, TRAY.y + TRAY.d - 1.6, TRAY_TOP]),
        at([TRAY.x + TRAY.w - 1.6, TRAY.y + TRAY.d - 1.6, TRAY_TOP])
      ],
      { size: 0.4 }
    )
  )
  // Empty slots, one per token, a K row and a V row
  const slots = []
  for (let i = 0; i < SLOTS; i++)
    for (const row of ROWS)
      slots.push(k.planOutline({ x: slotX(i), y: row.y, w: TILE_W, d: row.d, r: 0.8 }, TRAY_TOP, P, 2))
  out.push(L(slots.join(''), { tone: 'faint' }))
  // Tiles, back to front. Each tile is its own group so the animation can show it.
  const tiles = []
  for (let i = 0; i < SLOTS; i++)
    for (const row of ROWS) tiles.push({ i, row, d: depth([slotX(i) + TILE_W / 2, row.y + row.d / 2, TRAY_TOP]) })
  tiles.sort((a, b) => a.d - b.d)
  for (const { i, row } of tiles) {
    const generated = i >= PROMPT
    out.push(`<g class="${generated ? `kv-gen kv-gen-${i - PROMPT}` : 'kv-prompt'}">${tile(i, row, generated)}</g>`)
  }
  return out.join('')
}

// --- press (prefill): a C-frame, so nothing stands in front of the tray ------------------------
const SPINE = { x: X_P - 11, y: -52, w: 22, d: 14, r: 2 }
function pressSpine() {
  const out = []
  const foot = { x: X_P - 15, y: -57, w: 30, d: 19, r: 2.5 }
  out.push(S(k.slabOf(foot, 0, 6, P, 3, 0.6), { tone: 'mid' }))
  out.push(
    D(
      k.corners(foot, 3).map(([x, y]) => at([x, y, 6])),
      { size: 0.45 }
    )
  )
  const seams = [30, 62].map((z) => L(k.sideSeam(SPINE, z, P, 3), { tone: 'faint' })).join('')
  out.push(S(k.slabOf(SPINE, 6, COL_TOP - 6, P, 3, 0.6), { tone: 'mid', inner: seams }))
  return out.join('')
}

function ram() {
  const out = []
  out.push(S(k.slabOf(PLATEN, PLATEN_Z, PLATEN_H, P, 4, 0.8), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(PLATEN, 4), PLATEN_Z + PLATEN_H, P, 4), { tone: 'faint' }))
  out.push(
    D(
      k.corners(PLATEN, 2.2).map(([x, y]) => at([x, y, PLATEN_Z + PLATEN_H])),
      { size: 0.45 }
    )
  )
  // Rod into the cylinder; the cylinder, drawn later, hides the part inside it.
  out.push(S(k.cylinder(X_P, 0, 6, PLATEN_Z + PLATEN_H, 2.4, P, 24), { tone: 'mid' }))
  out.push(
    S(k.cylinder(X_P, 0, 3.4, PLATEN_Z + PLATEN_H + 2.4, COL_TOP - 2 - (PLATEN_Z + PLATEN_H + 2.4), P, 24), {
      tone: 'hi',
      crease: 'none'
    })
  )
  return out.join('')
}

function pressHead() {
  const out = []
  // Hydraulic cylinder hanging under the crosshead
  out.push(S(k.cylinder(X_P, 0, CYL_R + 1.2, CYL_Z, 3, P, 40), { tone: 'mid' }))
  out.push(L(k.ring(X_P, 0, 3.9, CYL_Z + 3, P, 20), { tone: 'lo' }))
  out.push(S(k.cylinder(X_P, 0, CYL_R, CYL_Z + 3, COL_TOP - CYL_Z - 3, P, 40), { tone: 'mid', crease: 'none' }))
  out.push(L([72, 84].map((z) => k.sideArc(X_P, 0, CYL_R, z, P, 24)).join(''), { tone: 'faint' }))
  return out.join('')
}

function crosshead() {
  const out = []
  const z = COL_TOP
  const top = z + HEAD_H
  out.push(
    S(k.slabOf(HEAD, z, HEAD_H, P, 4, 1), { tone: 'mid', inner: L(k.sideSeam(HEAD, z + 6, P, 4), { tone: 'faint' }) })
  )
  // Tie-rod nuts over the spine
  for (const [x, y] of byDepth([
    [X_P - 6, -45],
    [X_P + 6, -45]
  ])) {
    out.push(S(k.cylinder(x, y, 3.4, top, 2.4, P, 6), { tone: 'mid' }))
    out.push(D([at([x, y, top + 2.4])], { size: 0.45, tone: 'hi' }))
  }
  // Valve knob
  const knob = [X_P, -28]
  out.push(S(k.cylinder(knob[0], knob[1], 6, top, 4.5, P, 32), { tone: 'mid' }))
  out.push(L(k.knurl(knob[0], knob[1], 6, top, top + 4.5, 36, P), { tone: 'lo' }))
  out.push(L(k.lineOnTop(knob, [knob[0] + 4.6, knob[1] - 2], top + 4.5, P), { tone: 'hi', free: 'end' }))
  out.push(D([at([knob[0], knob[1], top + 4.5])], { size: 0.5, tone: 'hi' }))
  // Pressure gauge
  const g = [X_P, 0]
  out.push(S(k.cylinder(g[0], g[1], 7.5, top, 4, P, 48, 0.5), { tone: 'hi', crease: 'lo' }))
  out.push(L(k.ring(g[0], g[1], 6.3, top + 4, P, 40), { tone: 'lo' }))
  const t = k.radialTicks(g[0], g[1], 6.1, 24, 4, top + 4, [0.9, 1.8], P, -Math.PI * 0.75, Math.PI * 1.5)
  out.push(L(t.minor, { tone: 'lo' }), L(t.major, { tone: 'mid' }))
  out.push(L(k.lineOnTop([g[0] - 1.2, g[1] + 1.2], [g[0] + 3.4, g[1] - 3.4], top + 4.1, P), { tone: 'hi', free: true }))
  out.push(L(k.ring(g[0], g[1], 0.9, top + 4, P, 12), { tone: 'mid' }))
  // Corner screws
  out.push(
    D(
      k.corners(HEAD, 3.5).map(([x, y]) => at([x, y, top])),
      { size: 0.45 }
    )
  )
  return out.join('')
}

// --- decode gantry -----------------------------------------------------------------------
function gantryRail(y) {
  const out = []
  for (const x of byDepth([
    [G_RAIL.x + 8, y],
    [G_RAIL.x + G_RAIL.w - 8, y]
  ]).map((p) => p[0])) {
    out.push(S(k.cylinder(x, y, 5.5, 0, 2.4, P, 24), { tone: 'mid' }))
    out.push(S(k.cylinder(x, y, 3.2, 2.4, G_RAIL_Z - 2.4, P, 24), { tone: 'mid', crease: 'none' }))
  }
  const plan = { x: G_RAIL.x, y: y - 3, w: G_RAIL.w, d: 6, r: 1 }
  out.push(S(k.slabOf(plan, G_RAIL_Z, G_RAIL_H, P, 3, 0.4), { tone: 'mid' }))
  const top = G_RAIL_Z + G_RAIL_H
  for (const x of [G_RAIL.x, G_RAIL.x + G_RAIL.w - 4]) {
    out.push(S(k.slabOf({ x, y: y - 4, w: 4, d: 8, r: 1 }, top, 4, P, 2, 0.3), { tone: 'mid' }))
  }
  out.push(
    D(
      [G_RAIL.x + 8, X_D - 20, X_D + 20, G_RAIL.x + G_RAIL.w - 8].map((x) => at([x, y, top])),
      { size: 0.4 }
    )
  )
  return out.join('')
}

function upright(y) {
  const out = []
  const z = G_RAIL_Z + G_RAIL_H
  const shoe = { x: PARK - 8, y: y - 6, w: 16, d: 12, r: 1.5 }
  out.push(S(k.slabOf(shoe, z, 6, P, 3, 0.5), { tone: 'mid' }))
  out.push(
    D(
      k.corners(shoe, 2.4).map(([x, yy]) => at([x, yy, z + 6])),
      { size: 0.4 }
    )
  )
  const post = { x: PARK - 4.5, y: y - 4.5, w: 9, d: 9, r: 1.5 }
  out.push(S(k.slabOf(post, z + 6, UP_TOP - z - 6, P, 3, 0.4), { tone: 'mid' }))
  return out.join('')
}

function gantryFront() {
  const out = []
  // Hangers and the read bar
  for (const y of [-12, 12]) {
    out.push(S(k.cylinder(PARK, y, 1.3, BAR_Z + 3, UP_TOP - BAR_Z - 3, P, 12), { tone: 'mid', crease: 'none' }))
  }
  const bar = { x: PARK - 3.2, y: -19, w: 6.4, d: 38, r: 1.2 }
  out.push(S(k.slabOf(bar, BAR_Z, 3, P, 3, 0.4), { tone: 'hi', lit: true }))
  out.push(
    D(
      Array.from({ length: 9 }, (_, i) => at([PARK, -16 + i * 4, BAR_Z + 3])),
      { size: 0.4, tone: 'mid' }
    )
  )
  // Gusset and the cantilever arm
  out.push(S(k.slabOf({ x: PARK - 3, y: -RAIL_Y + 4.5, w: 6, d: 9, r: 1 }, UP_TOP - 9, 9, P, 2, 0.3), { tone: 'mid' }))
  const arm = { x: PARK - 5, y: -RAIL_Y - 6, w: 10, d: RAIL_Y + 6 + 22, r: 1.5 }
  out.push(S(k.slabOf(arm, UP_TOP, 7, P, 3, 0.6), { tone: 'mid' }))
  out.push(
    D(
      [-RAIL_Y, -12, 12].map((y) => at([PARK, y, UP_TOP + 7])),
      { size: 0.45 }
    )
  )
  return out.join('')
}

// --- timeline ----------------------------------------------------------------------------
const T = 14 // seconds per loop
const pct = (t) => `${((t / T) * 100).toFixed(3)}%`
const EASE = 'cubic-bezier(.45,0,.25,1)'
const LINEAR = 'linear'

const CAR_P = shift(X_P)
const CAR_D = shift(X_D)
const RAM_DOWN = shift(0, 0, -RAM_DROP)
const slot0 = X_D + slotX(0) + TILE_W / 2
const SWEEP = shift(slot0 - PARK)
const STEP0 = 4.8
const STEP = 1.6
const SWEEP_T = 0.6
const FREE_AT = 11.2

const tr = ([x, y]) => `translate(${x}px,${y}px)`
const keyframes = (name, frames) =>
  `@keyframes ${name}{${frames.map(([t, body, ease]) => `${pct(t)}{${body}${ease ? `;animation-timing-function:${ease}` : ''}}`).join('')}}`

const css = []
css.push(
  keyframes('bench-car', [
    [0, `transform:${tr(CAR_P)}`],
    [2.6, `transform:${tr(CAR_P)}`, EASE],
    [4.4, `transform:${tr(CAR_D)}`],
    [11.8, `transform:${tr(CAR_D)}`, EASE],
    [13.6, `transform:${tr(CAR_P)}`],
    [14, `transform:${tr(CAR_P)}`]
  ])
)
css.push(
  keyframes('bench-ram', [
    [0, 'transform:translate(0px,0px)'],
    [0.6, 'transform:translate(0px,0px)', 'cubic-bezier(.55,0,.85,.4)'],
    [1.4, `transform:${tr(RAM_DOWN)}`],
    [1.6, `transform:${tr(RAM_DOWN)}`, 'cubic-bezier(.2,.6,.35,1)'],
    [2.4, 'transform:translate(0px,0px)'],
    [14, 'transform:translate(0px,0px)']
  ])
)
const sweepFrames = [[0, 'transform:translate(0px,0px)']]
for (let s = 0; s < GENERATED; s++) {
  const t0 = STEP0 + s * STEP
  sweepFrames.push([t0, 'transform:translate(0px,0px)', LINEAR])
  sweepFrames.push([t0 + SWEEP_T, `transform:${tr(SWEEP)}`, LINEAR])
  sweepFrames.push([t0 + 2 * SWEEP_T, 'transform:translate(0px,0px)'])
}
sweepFrames.push([14, 'transform:translate(0px,0px)'])
css.push(keyframes('bench-gantry', sweepFrames))

const show = (name, t0, t1, fade = 0.15) => {
  const frames = []
  if (t0 > 0) frames.push([0, 'opacity:0'], [Math.max(0, t0 - fade), 'opacity:0'])
  frames.push([t0, 'opacity:1'], [t1, 'opacity:1'])
  if (t1 < T) frames.push([Math.min(T, t1 + fade), 'opacity:0'], [T, 'opacity:0'])
  return keyframes(name, frames)
}
css.push(
  show('bench-prompt', 1.45, FREE_AT, 0.1).replace(
    `${pct(FREE_AT + 0.1)}{opacity:0}`,
    `${pct(FREE_AT + 0.4)}{opacity:0}`
  )
)
for (let s = 0; s < GENERATED; s++) {
  const j = PROMPT + s
  const u = (X_D + slotX(j) + TILE_W / 2 - slot0) / (PARK - slot0)
  const appear = STEP0 + s * STEP + SWEEP_T + SWEEP_T * u
  css.push(
    show(`bench-gen-${s}`, appear + 0.18, FREE_AT, 0.18).replace(
      `${pct(FREE_AT + 0.18)}{opacity:0}`,
      `${pct(FREE_AT + 0.4)}{opacity:0}`
    )
  )
}

// Phase labels (bottom left) and readouts (bottom right)
const phases = [
  { id: 'p0', t0: 0, t1: 2.5, hint: 'Prefill · compute-bound', read: `${PROMPT} prompt tokens · one pass` },
  { id: 'p1', t0: 2.5, t1: STEP0 - 0.1, hint: 'KV handoff · RDMA', read: `${PROMPT} × 320 KiB = ${mib(PROMPT)} MiB` },
  ...Array.from({ length: GENERATED }, (_, s) => ({
    id: `p${2 + s}`,
    t0: STEP0 + s * STEP - (s === 0 ? 0.1 : 0),
    t1: STEP0 + (s + 1) * STEP,
    hint: 'Decode · bandwidth-bound',
    read: `token ${PROMPT + s + 1} · rereads ${PROMPT + s} cached`
  })),
  { id: 'p6', t0: FREE_AT, t1: T, hint: 'Request done · blocks freed', read: 'next prompt' }
]
// Merge the decode hints into one label so it doesn't blink between steps.
const hintSpans = [
  { id: 'h0', t0: 0, t1: 2.5, text: phases[0].hint },
  { id: 'h1', t0: 2.5, t1: STEP0 - 0.1, text: phases[1].hint },
  { id: 'h2', t0: STEP0 - 0.1, t1: FREE_AT, text: 'Decode · bandwidth-bound' },
  { id: 'h3', t0: FREE_AT, t1: T, text: phases.at(-1).hint }
]
for (const h of hintSpans) css.push(show(`bench-${h.id}`, h.t0, h.t1))
for (const p of phases) css.push(show(`bench-${p.id}`, p.t0, p.t1))

const STILL_HINT = 'Prefill → handoff → decode'
const STILL_READ = `${SLOTS} tokens cached · ${mib(SLOTS)} MiB`

const motion = `
@media (prefers-reduced-motion:no-preference){
  .bench-still{opacity:0}
  .bench-car{animation:bench-car ${T}s infinite}
  .bench-ram{animation:bench-ram ${T}s infinite}
  .bench-gantry{animation:bench-gantry ${T}s infinite}
  .kv-prompt{animation:bench-prompt ${T}s infinite}
  ${Array.from({ length: GENERATED }, (_, s) => `.kv-gen-${s}{animation:bench-gen-${s} ${T}s infinite}`).join('\n  ')}
  ${hintSpans.map((h) => `.bench-${h.id}{animation:bench-${h.id} ${T}s infinite}`).join('\n  ')}
  ${phases.map((p) => `.bench-${p.id}{animation:bench-${p.id} ${T}s infinite}`).join('\n  ')}
  ${css.join('\n  ')}
}`

const style = `
svg.iso[data-theme="light"]{--anatomy-paper:#fafafa;--anatomy-card:#fafafa}
.bench-text{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:10.5px;letter-spacing:.04em;fill:#8c8c90}
.bench-text[data-strong]{fill:#57575a}
.bench-text[data-caps]{text-transform:uppercase;letter-spacing:.1em}
.bench-anim{opacity:0}
.kv-new>.iso-top{fill:#3c3c40}
.kv-new>.iso-shade,.kv-new>.iso-fill{fill:#232326}
.bench-still{opacity:1}
@media (max-width:520px){
  .bench-text{font-size:19px}
  .bench-hint{transform:translateY(-26px)}
}
${motion}`

// --- assemble ------------------------------------------------------------------------------
const corner = (x, y, text, { anchor = 'start', strong = false, caps = false, className = '' } = {}) =>
  `<text class="bench-text ${className}" x="${x}" y="${y}" text-anchor="${anchor}"${strong ? ' data-strong=""' : ''}${caps ? ' data-caps=""' : ''}>${text}</text>`

const PADX = 22
const TOPY = 26
const BOTY = HEIGHT - 18
const texts = [
  corner(PADX, TOPY, 'Fig 1', { strong: true }),
  corner(WIDTH - PADX, TOPY, 'Prefill / decode split', { anchor: 'end', caps: true }),
  corner(PADX, BOTY, STILL_HINT, { caps: true, className: 'bench-still bench-hint' }),
  corner(WIDTH - PADX, BOTY, STILL_READ, { anchor: 'end', strong: true, className: 'bench-still' }),
  ...hintSpans.map((h) => corner(PADX, BOTY, h.text, { caps: true, className: `bench-anim bench-hint bench-${h.id}` })),
  ...phases.map((p) =>
    corner(WIDTH - PADX, BOTY, p.read, { anchor: 'end', strong: true, className: `bench-anim bench-${p.id}` })
  )
]

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  standalone: 'light',
  label:
    'A workbench with two stations joined by a rail. On the left, a hydraulic press stamps all eight prompt tokens into a tray of key and value tiles in one stroke: prefill. The carriage then carries the tray along the rail to the right-hand station: the KV cache handoff. There, a gantry sweeps a read bar over every cached tile before each new token is added, one tile pair at a time: decode.',
  body: [
    `<style>${style}</style>`,
    base(),
    rails(),
    pressSpine(),
    gantryRail(-RAIL_Y),
    `<g class="bench-gantry">${upright(-RAIL_Y)}</g>`,
    `<g class="bench-car" transform="${k.translateAlong(P, [X_D, 0, 0])}">${carriage()}</g>`,
    `<g class="bench-ram">${ram()}</g>`,
    pressHead(),
    crosshead(),
    `<g class="bench-gantry">${gantryFront()}</g>`,
    ...texts
  ]
})

mkdirSync(dirname(OUT_SVG), { recursive: true })
writeFileSync(OUT_SVG, svg.replace('<svg ', `<svg width="${WIDTH}" height="${HEIGHT}" `))
console.info('wrote', OUT_SVG, `${(svg.length / 1024).toFixed(1)} KiB`)

if (values.preview) {
  const page = k.pageHtml({
    title: 'Prefill and decode bench',
    theme: 'light',
    width: 720,
    body: `<figure class="iso-figure"><div class="iso-plate" style="padding:0;background:#fafafa;box-shadow:0 0 0 1px #e4e4e7">${svg}</div></figure>`
  })
  writeFileSync(resolve(values.preview), page)
  console.info('wrote', resolve(values.preview))
}
