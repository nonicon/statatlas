// StatAtlas charts: hand-built SVG, no libraries and no network.
// Every builder takes plain data and returns an SVG string with labelled
// axes, a readable value on each point or bar, and a text alternative in
// the <title> of each mark, so the numbers are available without the picture.

const INK = "#0b2a4a";
const TEAL = "#0f5b7a";
const RED = "#c8102e";
const GRID = "#e3ddd2";
const MUTED = "#6b6455";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function openSvg(width, height, label) {
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" ` +
    `aria-label="${escapeHtml(label)}" preserveAspectRatio="xMidYMid meet">`;
}

// Short axis tick labels: 1,400 becomes "1.4k", 250 stays "250".
function tickLabel(v) {
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k";
  if (Math.abs(v) >= 100) return String(Math.round(v));
  return String(Number(v.toFixed(1)));
}

function gridLines(top, bottom, left, right, low, high) {
  let out = "";
  for (let step = 0; step <= 4; step++) {
    const v = low + ((high - low) * step) / 4;
    const y = top + (bottom - top) * (1 - (v - low) / (high - low));
    out += `<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="${GRID}" stroke-width="1"/>` +
      `<text x="${left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="${MUTED}">${tickLabel(v)}</text>`;
  }
  return out;
}

// Line chart with a dot and a value label on each point.
// points: [{label, value, display}] — display is the text shown on the chart.
export function lineChart(points, options = {}) {
  const width = 720, height = 300;
  const left = 52, right = width - 16, top = 26, bottom = height - 34;
  const values = points.map((p) => p.value);
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (low > 0) low = Math.max(0, low - (high - low) * 0.25);
  if (high === low) { high += 1; low -= 1; }
  const span = high - low;
  const px = (i) => left + ((right - left) * i) / (points.length - 1);
  const py = (v) => top + (bottom - top) * (1 - (v - low) / span);
  const every = options.labelEvery || 1;
  // Value labels: keep the last point's label, and drop any earlier label
  // whose text would run into the next kept one (the final two points of a
  // rising series sit close together, so their labels collide).
  const candidates = [];
  points.forEach((p, i) => {
    if (i % every === 0 || i === points.length - 1) {
      const text = p.display ?? String(p.value);
      const anchor = i === 0 ? "start" : (i === points.length - 1 ? "end" : "middle");
      const lx = i === 0 ? px(i) + 2 : (i === points.length - 1 ? px(i) - 2 : px(i));
      candidates.push({ i, text, anchor, x: lx, y: py(p.value) - 11 });
    }
  });
  const approxWidth = (text) => text.length * 6.8;
  const leftEdge = (c) => c.anchor === "start" ? c.x : (c.anchor === "end" ? c.x - approxWidth(c.text) : c.x - approxWidth(c.text) / 2);
  const rightEdge = (c) => leftEdge(c) + approxWidth(c.text);
  const kept = [];
  for (const c of candidates) {
    const prev = kept[kept.length - 1];
    if (prev && leftEdge(c) < rightEdge(prev) + 4) {
      // A collision: the newest label wins when it is the last point,
      // otherwise the earlier one stands and this one is dropped.
      if (c.i === points.length - 1) kept.pop();
      else continue;
    }
    kept.push(c);
  }
  const labelByIndex = new Map(kept.map((c) => [c.i, c]));
  let marks = "";
  points.forEach((p, i) => {
    const text = p.display ?? String(p.value);
    marks += `<circle cx="${px(i).toFixed(1)}" cy="${py(p.value).toFixed(1)}" r="4.5" fill="${INK}" stroke="#fff" stroke-width="2">` +
      `<title>${escapeHtml(p.label)}: ${escapeHtml(text)}</title></circle>`;
    const lab = labelByIndex.get(i);
    if (lab) {
      marks += `<text x="${lab.x.toFixed(1)}" y="${lab.y.toFixed(1)}" text-anchor="${lab.anchor}" font-size="11.5" font-weight="600" fill="${INK}">${escapeHtml(lab.text)}</text>`;
    }
    marks += `<text x="${px(i).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="11" fill="${MUTED}">${escapeHtml(p.label)}</text>`;
  });
  const path = points.map((p, i) => `${px(i).toFixed(1)},${py(p.value).toFixed(1)}`).join(" ");
  return openSvg(width, height, options.label || "Line chart") +
    gridLines(top, bottom, left, right, low, high) +
    `<polyline points="${path}" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    marks + `</svg>`;
}

// Vertical bar chart with a value label above every bar.
// Negative bars (a recession year, for example) are drawn in red.
export function barChart(points, options = {}) {
  const width = 720, height = 300;
  const left = 52, right = width - 12, top = 26, bottom = height - 34;
  const values = points.map((p) => p.value);
  const high = Math.max(...values, 0);
  const low = Math.min(...values, 0);
  const span = high - low || 1;
  const slot = (right - left) / points.length;
  const py = (v) => top + (bottom - top) * (1 - (v - low) / span);
  const zeroY = py(0);
  let bars = "";
  points.forEach((p, i) => {
    const text = p.display ?? String(p.value);
    const bx = left + slot * i + slot * 0.18;
    const bw = slot * 0.64;
    const topY = Math.min(py(p.value), zeroY);
    const bh = Math.abs(zeroY - py(p.value));
    const fill = p.value < 0 ? RED : (options.color || TEAL);
    bars += `<rect x="${bx.toFixed(1)}" y="${topY.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(bh, 2).toFixed(1)}" rx="3" fill="${fill}">` +
      `<title>${escapeHtml(p.label)}: ${escapeHtml(text)}</title></rect>` +
      `<text x="${(bx + bw / 2).toFixed(1)}" y="${(topY - 6).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${INK}">${escapeHtml(text)}</text>` +
      `<text x="${(bx + bw / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="11" fill="${MUTED}">${escapeHtml(p.label)}</text>`;
  });
  return openSvg(width, height, options.label || "Bar chart") +
    gridLines(top, bottom, left, right, low, high) + bars + `</svg>`;
}

// Horizontal bar chart, for ranked categories such as provinces or age bands.
export function hbarChart(points, options = {}) {
  const rowH = options.rowHeight || 34;
  const width = 720;
  const height = rowH * points.length + 30;
  const labelW = options.labelWidth || 150;
  const right = width - 64, top = 8;
  const max = Math.max(...points.map((p) => p.value));
  let rows = "";
  points.forEach((p, i) => {
    const text = p.display ?? String(p.value);
    const y = top + i * rowH;
    const bw = ((right - labelW) * p.value) / max;
    rows += `<text x="${labelW - 10}" y="${y + 19}" text-anchor="end" font-size="12.5" fill="#1d2b36">${escapeHtml(p.label)}</text>` +
      `<rect x="${labelW}" y="${y + 6}" width="${Math.max(bw, 2).toFixed(1)}" height="18" rx="3" fill="${p.color || TEAL}">` +
      `<title>${escapeHtml(p.label)}: ${escapeHtml(text)}</title></rect>` +
      `<text x="${(labelW + bw + 8).toFixed(1)}" y="${y + 20}" font-size="12" font-weight="600" fill="${INK}">${escapeHtml(text)}</text>`;
  });
  return openSvg(width, height, options.label || "Horizontal bar chart") + rows + `</svg>`;
}

// Donut chart. The caller builds the legend beside it; the centre carries
// the largest segment, so the chart reads even without the legend.
// segments: [{name, share, color}]
export function donutChart(segments, options = {}) {
  const size = options.size || 220;
  const cx = size / 2, cy = size / 2;
  const outer = size / 2 - 14;
  const inner = outer * 0.62;
  const total = segments.reduce((sum, s) => sum + s.share, 0);
  let angle = -Math.PI / 2;
  let arcs = "";
  for (const s of segments) {
    const frac = s.share / total;
    const start = angle;
    const end = angle + frac * Math.PI * 2;
    angle = end;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + outer * Math.cos(start), y0 = cy + outer * Math.sin(start);
    const x1 = cx + outer * Math.cos(end), y1 = cy + outer * Math.sin(end);
    const ix1 = cx + inner * Math.cos(end), iy1 = cy + inner * Math.sin(end);
    const ix0 = cx + inner * Math.cos(start), iy0 = cy + inner * Math.sin(start);
    arcs += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${outer} ${outer} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} ` +
      `L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${ix0.toFixed(1)} ${iy0.toFixed(1)} Z" fill="${s.color}">` +
      `<title>${escapeHtml(s.name)}: ${s.share}%</title></path>`;
  }
  return openSvg(size, size, options.label || "Donut chart") + arcs +
    `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="22" font-weight="700" fill="${INK}">${escapeHtml(options.center || "")}</text>` +
    `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="11" fill="${MUTED}">${escapeHtml(options.centerSub || "")}</text></svg>`;
}

// Compact sparkline for KPI cards. values: numbers, oldest first.
export function sparkline(values, options = {}) {
  const width = options.width || 180;
  const height = options.height || 44;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  const px = (i) => (width * i) / (values.length - 1);
  const py = (v) => 4 + (height - 10) * (1 - (v - low) / span);
  const path = values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  return openSvg(width, height, options.label || "Trend") +
    `<polyline points="${path}" fill="none" stroke="${options.color || TEAL}" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="${px(last)}" cy="${py(values[last])}" r="3" fill="${RED}"/></svg>`;
}
