// StatAtlas views: one render function per page.
// Each view returns an HTML string built from the dataset in data.js and
// the SVG builders in charts.js. The controls are plain buttons, inputs
// and links; app.js wires them up after the view is mounted.

import {
  COUNTRY, HEADLINES, GDP_GROWTH, GDP_NOMINAL, GDP_IDR, POPULATION,
  AGE_GROUPS, POVERTY, UNEMPLOYMENT, LABOUR, EMPLOYMENT_SECTORS,
  GDP_SECTORS, TRADE, INFLATION, PROVINCES, WELLBEING, TRADE_SNAPSHOT,
  RELEASE_CALENDAR, SOURCES, DATA_NOTE,
} from "./data.js";
import { lineChart, barChart, hbarChart, donutChart, sparkline } from "./charts.js";

const PALETTE = ["#0b2a4a", "#0f5b7a", "#c8102e", "#e8a33d", "#5b8a72", "#8a7a5b"];

// Turn a series of {year, value} points into chart points with labels.
function points(rows, format) {
  return rows.map((r) => ({
    label: String(r.year ?? r.label),
    value: r.value,
    display: format ? format(r.value) : String(r.value),
  }));
}

function header(kicker, title, intro) {
  return `<header class="page-head"><p class="kicker">${kicker}</p>` +
    `<h1>${title}</h1><p class="lede">${intro}</p></header>`;
}

function cite(text) {
  return `<p class="source">Source: ${text}</p>`;
}

function kpi(item, trend) {
  return `<article class="kpi"><p class="kpi-label">${item.label}</p>` +
    `<p class="kpi-value">${item.value}</p><p class="kpi-note">${item.note}</p>` +
    (trend ? `<div class="kpi-spark">${sparkline(trend, { label: item.label + " trend" })}</div>` : "") +
    `<p class="kpi-meta">${item.year} &middot; ${item.source}</p></article>`;
}

function chartPanel(title, subtitle, chart, source, controls) {
  return `<section class="card chart-card"><div class="card-head"><div>` +
    `<h2>${title}</h2><p class="card-sub">${subtitle}</p></div>` +
    (controls ? `<div class="controls">${controls}</div>` : "") +
    `</div><div class="chart">${chart}</div>${cite(source)}</section>`;
}

function legendList(items) {
  return items.map((s) =>
    `<li><span class="swatch" style="background:${s.color}"></span>${s.name}<strong>${s.share}%</strong></li>`).join("");
}

function factList(rows) {
  return `<dl class="facts">` + rows.map(([term, text]) =>
    `<div><dt>${term}</dt><dd>${text}</dd></div>`).join("") + `</dl>`;
}

// ---------------------------------------------------------------- overview
export function viewOverview() {
  const growth = points(GDP_GROWTH, (v) => v.toFixed(2) + "%");
  const pop = points(POPULATION, (v) => v.toFixed(1) + "m");
  const trends = {
    Population: POPULATION.map((p) => p.value),
    "GDP growth": GDP_GROWTH.map((p) => p.value),
    Inflation: INFLATION.map((p) => p.value),
    "Poverty rate": POVERTY.map((p) => p.value),
  };
  const cards = HEADLINES.map((h) => kpi(h, trends[h.label])).join("");
  return header("Indonesia &middot; Official statistics, explained",
    "Indonesia in numbers",
    "The essential facts about the world's fourth most populous country — its people, " +
    "its economy and how life is changing — drawn from Statistics Indonesia (BPS) and the World Bank.") +
    `<section class="kpi-grid" aria-label="Headline indicators">${cards}</section>` +
    `<div class="two-col">` +
    chartPanel("Economic growth, 2015-2024",
      "Real GDP growth, percent per year. The 2020 contraction is the COVID-19 recession; growth has held near 5% since.",
      lineChart(growth, { label: "Real GDP growth 2015 to 2024", labelEvery: 2 }),
      "World Bank, World Development Indicators (NY.GDP.MKTP.KD.ZG); BPS.",
      `<button class="chip is-active" data-range="all" data-chart="growth">2015-2024</button>` +
      `<button class="chip" data-range="recent" data-chart="growth">2020-2024</button>`) +
    chartPanel("Population, 2015-2024",
      "Total population in millions. Indonesia passed 280 million people in 2023.",
      lineChart(pop, { label: "Population 2015 to 2024", labelEvery: 2 }),
      "World Bank, World Development Indicators (SP.POP.TOTL).") +
    `</div>` +
    `<section class="card"><h2>At a glance</h2>` +
    factList([
      ["Capital", `${COUNTRY.capital} — the new capital ${COUNTRY.newCapital}`],
      ["Land area", `${COUNTRY.areaKm2.toLocaleString("en-US")} km&sup2; across ${COUNTRY.islands.toLocaleString("en-US")} islands`],
      ["Provinces", `${COUNTRY.provinces} provinces, from Aceh to South Papua`],
      ["Currency", COUNTRY.currency],
      ["Official language", COUNTRY.language],
      ["Time zones", COUNTRY.timeZones],
    ]) +
    cite("BPS; World Bank. Figures are the latest published values, November 2026.") + `</section>` +
    `<section class="card"><h2>Explore the data</h2><nav class="topic-links">` +
    `<a href="#/economy"><strong>Economy</strong><span>GDP, growth, trade and prices</span></a>` +
    `<a href="#/population"><strong>Population</strong><span>Size, age structure and provinces</span></a>` +
    `<a href="#/work"><strong>Work</strong><span>Jobs, unemployment and informality</span></a>` +
    `<a href="#/wellbeing"><strong>Wellbeing</strong><span>Poverty, health and education</span></a>` +
    `<a href="#/regions"><strong>Regions</strong><span>All 15 largest provinces, compared</span></a>` +
    `<a href="#/sources"><strong>Sources &amp; methods</strong><span>Where every figure comes from</span></a>` +
    `</nav></section>`;
}

// ----------------------------------------------------------------- economy
export function viewEconomy() {
  const growth = points(GDP_GROWTH, (v) => v.toFixed(2) + "%");
  const nominal = points(GDP_NOMINAL, (v) => "$" + v.toLocaleString("en-US") + "bn");
  const exportsSeries = TRADE.map((t) => ({
    label: String(t.year), value: t.exports, display: "$" + t.exports + "bn",
  }));
  const inflation = points(INFLATION, (v) => v.toFixed(2) + "%");
  const sectors = GDP_SECTORS.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }));
  const tradeRows = TRADE_SNAPSHOT.map((t) =>
    `<tr><td>${t.label}</td><td class="num">${t.value}</td><td>${t.year}</td><td>${t.source}</td></tr>`).join("");
  return header("Economy", "A $1.4 trillion economy, growing near 5% a year",
    "Indonesia is Southeast Asia's largest economy and the world's 16th largest. Growth has averaged " +
    "about 5% a year for a decade, interrupted only by the pandemic year of 2020.") +
    `<div class="two-col">` +
    chartPanel("GDP, current US dollars",
      "Nominal GDP in billions of US dollars. Switch to rupiah to see the same series in local currency.",
      `<div id="gdp-chart">${lineChart(nominal, { label: "Nominal GDP 2015 to 2024", labelEvery: 2 })}</div>`,
      "World Bank, World Development Indicators (NY.GDP.MKTP.CD); rupiah series: BPS.",
      `<button class="chip is-active" data-currency="usd">US dollars</button>` +
      `<button class="chip" data-currency="idr">Rupiah</button>`) +
    chartPanel("Real GDP growth",
      "Annual percent change in real GDP. The bars below zero mark the 2020 recession.",
      barChart(growth, { label: "Real GDP growth 2015 to 2024", color: "#0f5b7a" }),
      "World Bank, World Development Indicators (NY.GDP.MKTP.KD.ZG); BPS.") +
    `</div>` +
    `<div class="two-col">` +
    `<section class="card chart-card"><div class="card-head"><div><h2>What the economy makes</h2>` +
    `<p class="card-sub">Share of GDP by sector, 2024. Manufacturing is the largest single sector; services together are more than half.</p></div></div>` +
    `<div class="donut-wrap"><div class="chart">${donutChart(sectors, { label: "GDP by sector 2024", center: "18.7%", centerSub: "Manufacturing" })}</div>` +
    `<ul class="legend">${legendList(sectors)}</ul></div>${cite("BPS, national accounts 2024 (rounded).")}</section>` +
    chartPanel("Exports of goods",
      "Exports in billions of US dollars. The 2022 peak followed the global commodity price surge.",
      barChart(exportsSeries, { label: "Exports of goods 2015 to 2024", color: "#0f5b7a" }),
      "BPS, foreign trade statistics.") +
    `</div>` +
    `<div class="two-col">` +
    chartPanel("Inflation",
      "Consumer price inflation, December to December. The 2022 spike followed a fuel-price adjustment; by 2024 it was back to 1.57%.",
      lineChart(inflation, { label: "Consumer price inflation 2015 to 2024", labelEvery: 2 }),
      "BPS, Consumer Price Index.") +
    `<section class="card"><h2>Trade &amp; finance, 2024</h2>` +
    `<table class="data-table"><thead><tr><th>Indicator</th><th class="num">Value</th><th>Year</th><th>Source</th></tr></thead>` +
    `<tbody>${tradeRows}</tbody></table>${cite("BPS; Bank Indonesia; World Bank.")}</section>` +
    `</div>`;
}

// -------------------------------------------------------------- population
export function viewPopulation() {
  const pop = points(POPULATION, (v) => v.toFixed(1) + "m");
  const ages = AGE_GROUPS.map((a) => ({
    label: a.group + " years", value: a.share, display: a.share.toFixed(1) + "%",
  }));
  const topProvinces = [...PROVINCES]
    .sort((a, b) => b.population - a.population)
    .slice(0, 10)
    .map((p) => ({ label: p.name, value: p.population, display: p.population.toFixed(2) + "m" }));
  return header("Population", "283.5 million people on 17,000 islands",
    "Indonesia is the world's fourth most populous country. Just over half of its people live on Java, " +
    "the most densely populated large island on earth, and the population is still young: the median age is about 30.") +
    `<div class="two-col">` +
    chartPanel("Population growth, 2015-2024",
      "Total population in millions. Growth has slowed to about 0.8% a year as fertility falls.",
      lineChart(pop, { label: "Population 2015 to 2024", labelEvery: 2 }),
      "World Bank, World Development Indicators (SP.POP.TOTL).") +
    chartPanel("Age structure, 2024",
      "Share of the population in each age band. One in four Indonesians is under 15; about 7% are 65 or older.",
      hbarChart(ages, { label: "Population by age group 2024", labelWidth: 120 }),
      "World Bank, World Development Indicators; working-age bands split the published 15-64 total.") +
    `</div>` +
    `<section class="card"><h2>Where people live</h2>` +
    `<p class="card-sub">The ten largest provinces hold more than three quarters of the population. ` +
    `Java's three largest provinces alone hold 130 million people — more than Japan.</p>` +
    `<div class="chart">${hbarChart(topProvinces, { label: "Ten largest provinces by population 2024" })}</div>` +
    `${cite("BPS, 2024 population estimates.")}` +
    `<p><a class="btn" href="#/regions">Compare all 15 largest provinces &rarr;</a></p></section>` +
    `<section class="card"><h2>Population in context</h2>` +
    factList([
      ["Annual growth", "0.81% in 2024, down from 1.3% a decade earlier"],
      ["Fertility", "2.12 children per woman in 2024 — near replacement level"],
      ["Urban share", "58.8% of people live in urban areas (2024)"],
      ["Density", "149 people per km&sup2; nationally; about 16,400 per km&sup2; in Jakarta"],
      ["Largest city", "Jakarta, about 10.7 million people in the city proper"],
      ["2020 census", "270.2 million people — the last full census"],
    ]) +
    cite("World Bank; BPS; 2020 Population Census.") + `</section>`;
}

// -------------------------------------------------------------------- work
export function viewWork() {
  const unemp = points(UNEMPLOYMENT, (v) => v.toFixed(2) + "%");
  const sectors = EMPLOYMENT_SECTORS.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }));
  return header("Work", "153 million people in the labour force",
    "Unemployment has stayed below 5% since early 2024, but most work is informal: almost six in ten " +
    "workers have no formal contract or social protection. Agriculture still employs more people than any other sector.") +
    `<section class="kpi-grid" aria-label="Labour market indicators">` +
    kpi({ label: "Labour force", value: LABOUR.labourForce, note: "People working or looking for work", year: "Feb 2025", source: "BPS, Sakernas" }) +
    kpi({ label: "Employed", value: LABOUR.employed, note: "People in work", year: "Feb 2025", source: "BPS, Sakernas" }) +
    kpi({ label: "Unemployed", value: LABOUR.unemployed, note: "Open unemployment, 4.76%", year: "Feb 2025", source: "BPS, Sakernas" }) +
    kpi({ label: "Informal workers", value: LABOUR.informalShare, note: "Share of all employed people", year: "Feb 2025", source: "BPS, Sakernas" }) +
    `</section>` +
    `<div class="two-col">` +
    chartPanel("Open unemployment rate",
      "Percent of the labour force without work. The 2020 peak is the pandemic shock; the rate has fallen every year since.",
      barChart(unemp, { label: "Open unemployment rate 2019 to 2025", color: "#0f5b7a" }),
      "BPS, National Labour Force Survey (Sakernas), August rounds except where February is noted.") +
    `<section class="card chart-card"><div class="card-head"><div><h2>Where people work</h2>` +
    `<p class="card-sub">Share of all employed people by sector, February 2025.</p></div></div>` +
    `<div class="donut-wrap"><div class="chart">${donutChart(sectors, { label: "Employment by sector 2025", center: "28.4%", centerSub: "Agriculture" })}</div>` +
    `<ul class="legend">${legendList(sectors)}</ul></div>${cite("BPS, Sakernas, February 2025 (rounded).")}</section>` +
    `</div>` +
    `<section class="card"><h2>Reading the labour market</h2>` +
    factList([
      ["Participation", `${LABOUR.participation} of working-age people are in the labour force — higher for men than for women`],
      ["Full-time work", `${LABOUR.fullTimeShare} of employed people work 35 hours or more a week`],
      ["Informal work", `${LABOUR.informalShare} of workers are informal — mostly in agriculture, trade and family businesses`],
      ["Youth", "Unemployment is highest among people aged 15-24, and Gen Z is the most affected group"],
      ["One hour counts", "BPS counts anyone who worked at least one hour in the reference week as employed"],
    ]) +
    cite("BPS, Sakernas, February 2025.") + `</section>`;
}

// --------------------------------------------------------------- wellbeing
export function viewWellbeing() {
  const poverty = points(POVERTY, (v) => v.toFixed(2) + "%");
  const cards = WELLBEING.map((w) => kpi(w)).join("");
  return header("Wellbeing", "Poverty at its lowest level on record",
    "The share of Indonesians living below the national poverty line fell to 8.25% in September 2025 — " +
    "the lowest ever recorded. Health and schooling have improved steadily, though both still trail the region's richest countries.") +
    `<section class="kpi-grid" aria-label="Wellbeing indicators">${cards}</section>` +
    `<div class="two-col">` +
    chartPanel("Poverty rate, 2019-2025",
      "Percent of the population below the national poverty line, September each year. The pandemic pushed it above 10% in 2020; it has fallen every year since.",
      lineChart(poverty, { label: "Poverty rate 2019 to 2025", labelEvery: 1 }),
      "BPS, National Socio-Economic Survey (Susenas). The poverty line was IDR 669,235 per person per month in March 2026.") +
    `<section class="card"><h2>What the numbers mean</h2>` +
    factList([
      ["Poverty line", "IDR 669,235 per person per month (March 2026) — about IDR 22,300 a day"],
      ["Urban vs rural", "6.34% poor in cities, 10.67% in villages (March 2026)"],
      ["Extreme poverty", "0.78% of the population in September 2025, down from 1.26% in March 2024"],
      ["Inequality", "Gini ratio 0.379 in 2024, down from 0.388 in 2023"],
      ["Human development", "HDI 75.02 in 2024, in the \"high\" category; it was 74.39 in 2023"],
      ["Schooling", "Adults average 9.0 years of schooling; 96.5% of adults can read and write"],
    ]) +
    cite("BPS, Susenas and HDI releases; World Bank.") + `</section>` +
    `</div>`;
}

// ----------------------------------------------------------------- regions
export function viewRegions() {
  return header("Regions", "Thirty-eight provinces, one archipelago",
    "Search or sort the table to compare Indonesia's 15 largest provinces. Population figures are BPS 2024 estimates; " +
    "density is population divided by land area.") +
    `<section class="card"><div class="table-tools">` +
    `<label class="search-box"><span>Search provinces</span>` +
    `<input id="province-search" type="search" placeholder="Type a province, capital or island&hellip;" aria-label="Search provinces"></label>` +
    `<p class="table-hint">Click a column heading to sort. Density is people per km&sup2;.</p></div>` +
    `<div class="table-scroll"><table class="data-table sortable" id="province-table">` +
    `<thead><tr><th data-sort="name">Province</th><th data-sort="capital">Capital</th><th data-sort="island">Island</th>` +
    `<th data-sort="population" class="num">Population (millions)</th><th data-sort="area" class="num">Area (km&sup2;)</th>` +
    `<th data-sort="density" class="num">Density</th></tr></thead><tbody></tbody></table></div>` +
    `<p class="source">Source: BPS, 2024 population estimates and provincial areas. Jakarta's density reflects the city-province's 664 km&sup2;.</p>` +
    `<p class="table-note" id="province-count"></p></section>` +
    `<section class="card"><h2>The Java question</h2>` +
    `<p>Java covers about 7% of Indonesia's land but holds about 52% of its people. That concentration shapes almost every ` +
    `national statistic: infrastructure, votes, markets and universities are densest where the people are, while the ` +
    `eastern provinces — Papua, Maluku, East Nusa Tenggara — cover most of the land with a small share of the population. ` +
    `Any national average is, in effect, a Java-weighted average.</p>` +
    `${cite("BPS; 2020 Population Census.")}</section>`;
}

// ----------------------------------------------------------------- sources
export function viewSources() {
  const sourceRows = SOURCES.map((s) =>
    `<tr><td><strong>${s.short}</strong></td><td>${s.full}</td><td>${s.note}</td></tr>`).join("");
  const calendarRows = RELEASE_CALENDAR.map((r) =>
    `<tr><td>${r.date}</td><td>${r.release}</td><td>${r.agency}</td></tr>`).join("");
  return header("Sources & methods", "Where every figure comes from",
    "StatAtlas republishes figures from official statistics agencies. It collects no data of its own and runs no survey. " +
    "Every figure on this site names its source and year next to it; this page lists the sources in full and explains how the figures were chosen.") +
    `<section class="card"><h2>Sources</h2>` +
    `<table class="data-table"><thead><tr><th>Short name</th><th>Publisher</th><th>What it supplies</th></tr></thead>` +
    `<tbody>${sourceRows}</tbody></table></section>` +
    `<section class="card"><h2>Methods &amp; definitions</h2>` +
    factList([
      ["Population", "World Bank series (283.5 million, 2024). BPS's own mid-year estimate for 2024 is 281.6 million; the two differ because BPS projects from the 2020 census while the World Bank uses UN estimates. The site uses the World Bank figure and says so."],
      ["GDP", "Nominal GDP in current US dollars (World Bank) and in rupiah at current prices (BPS). Real growth is the annual change in constant-price GDP."],
      ["Poverty", "Share of people whose monthly per-capita expenditure falls below the BPS poverty line, from the National Socio-Economic Survey (Susenas)."],
      ["Unemployment", "Open unemployment rate: unemployed people as a share of the labour force, from the National Labour Force Survey (Sakernas). Working at least one hour in the reference week counts as employed."],
      ["Rounding", "Figures are rounded to the precision shown on each chart or card. Totals in charts may not sum to exactly 100% because of rounding."],
      ["Currency", "US dollar figures use the World Bank's conversion; the 2024 average rate was 15,855 rupiah per US dollar."],
    ]) + `</section>` +
    `<section class="card"><h2>Release calendar</h2><p class="card-sub">When the figures on this site are next updated, as published by BPS.</p>` +
    `<table class="data-table"><thead><tr><th>Date</th><th>Release</th><th>Agency</th></tr></thead>` +
    `<tbody>${calendarRows}</tbody></table></section>` +
    `<section class="card"><h2>Download the data</h2>` +
    `<p>Every series charted on this site is available as a CSV file, generated in your browser from the same data the charts use. No account, no request, no tracking.</p>` +
    `<p><button class="btn" id="download-csv">Download all series (CSV)</button></p>` +
    `<p class="source">${DATA_NOTE}</p></section>` +
    `<section class="card"><h2>About StatAtlas</h2>` +
    `<p>StatAtlas is an independent reference site. It is not affiliated with Statistics Indonesia, the World Bank, ` +
    `or the Government of Indonesia. Figures are republished for reference with their sources named; for official use, ` +
    `consult the publishing agency. Built November 2026. All figures are the latest published values available at that time.</p></section>`;
}

// The CSV download on the Sources page, built from the same series the
// charts draw, so the file and the pictures can never disagree.
export function buildCsv() {
  const lines = ["series,year,value,unit,source"];
  const addSeries = (name, rows, unit, source) => {
    for (const r of rows) {
      lines.push(`${name},${r.year ?? r.label},${r.value},"${unit}","${source}"`);
    }
  };
  addSeries("gdp_growth", GDP_GROWTH, "percent per year", "World Bank WDI");
  addSeries("gdp_nominal_usd_bn", GDP_NOMINAL, "US$ billions", "World Bank WDI");
  addSeries("gdp_nominal_idr_trn", GDP_IDR, "IDR trillions", "BPS");
  addSeries("population_millions", POPULATION, "millions", "World Bank WDI");
  addSeries("poverty_rate", POVERTY, "percent", "BPS Susenas");
  addSeries("unemployment_rate", UNEMPLOYMENT, "percent", "BPS Sakernas");
  addSeries("inflation_cpi", INFLATION, "percent", "BPS");
  for (const t of TRADE) {
    lines.push(`exports_usd_bn,${t.year},${t.exports},"US$ billions","BPS"`);
    lines.push(`imports_usd_bn,${t.year},${t.imports},"US$ billions","BPS"`);
  }
  for (const p of PROVINCES) {
    lines.push(`province_population_2024,${p.name},${p.population},"millions","BPS"`);
  }
  return lines.join("\n");
}

export { PROVINCES };
