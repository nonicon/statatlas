// StatAtlas app: hash router, navigation state, and the interactive
// controls on each page — the growth-chart range switch, the GDP currency
// switch, the province table's search and sorting, and the CSV download.
// The site makes no network requests: every figure comes from data.js,
// bundled with the site.

import { GDP_GROWTH, GDP_NOMINAL, GDP_IDR, PROVINCES } from "./data.js";
import { lineChart } from "./charts.js";
import {
  viewOverview, viewEconomy, viewPopulation, viewWork,
  viewWellbeing, viewRegions, viewSources, buildCsv,
} from "./views.js";

// One entry per page: the hash fragment, the document title, and the
// function that renders it.
const PAGES = {
  "": { title: "Indonesia in numbers", render: viewOverview },
  economy: { title: "Economy", render: viewEconomy },
  population: { title: "Population", render: viewPopulation },
  work: { title: "Work", render: viewWork },
  wellbeing: { title: "Wellbeing", render: viewWellbeing },
  regions: { title: "Regions", render: viewRegions },
  sources: { title: "Sources & methods", render: viewSources },
};

const mount = document.getElementById("page");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

// Province table state, kept across re-renders of the Regions page.
const provinceState = { sortKey: "population", sortDir: -1, query: "" };

function currentPage() {
  const fragment = (window.location.hash || "#/").replace(/^#\/?/, "").split("/")[0];
  return PAGES[fragment] ? fragment : "";
}

function showPage() {
  const name = currentPage();
  const page = PAGES[name];
  mount.innerHTML = page.render();
  document.title = `${page.title} — StatAtlas: Indonesia in Numbers`;
  for (const link of navLinks) {
    const target = link.getAttribute("href").replace(/^#\/?/, "");
    const active = target === name;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  window.scrollTo(0, 0);
  if (name === "regions") renderProvinceTable();
  attachControls();
}

// Mark one button in a group active and return the group.
function pickChip(button) {
  const group = button.parentElement.querySelectorAll("button");
  group.forEach((b) => b.classList.remove("is-active"));
  button.classList.add("is-active");
}

function chartPoints(rows, format) {
  return rows.map((r) => ({
    label: String(r.year ?? r.label),
    value: r.value,
    display: format(r.value),
  }));
}

function attachControls() {
  // Growth chart range switch (Overview page).
  mount.querySelectorAll("[data-chart='growth']").forEach((btn) => {
    btn.addEventListener("click", () => {
      pickChip(btn);
      const all = chartPoints(GDP_GROWTH, (v) => v.toFixed(2) + "%");
      const shown = btn.dataset.range === "recent" ? all.slice(-5) : all;
      const card = btn.closest(".chart-card").querySelector(".chart");
      card.innerHTML = lineChart(shown, { label: "Real GDP growth", labelEvery: 1 });
    });
  });

  // GDP currency switch (Economy page).
  mount.querySelectorAll("[data-currency]").forEach((btn) => {
    btn.addEventListener("click", () => {
      pickChip(btn);
      const holder = document.getElementById("gdp-chart");
      if (!holder) return;
      if (btn.dataset.currency === "idr") {
        const rows = chartPoints(GDP_IDR, (v) => v.toLocaleString("en-US") + " trn IDR");
        holder.innerHTML = lineChart(rows, { label: "Nominal GDP in rupiah 2015 to 2024", labelEvery: 2 });
      } else {
        const rows = chartPoints(GDP_NOMINAL, (v) => "$" + v.toLocaleString("en-US") + "bn");
        holder.innerHTML = lineChart(rows, { label: "Nominal GDP in US dollars 2015 to 2024", labelEvery: 2 });
      }
    });
  });

  // Province search box (Regions page).
  const search = document.getElementById("province-search");
  if (search) {
    search.addEventListener("input", () => {
      provinceState.query = search.value.trim().toLowerCase();
      renderProvinceTable();
    });
  }

  // CSV download (Sources page).
  const download = document.getElementById("download-csv");
  if (download) {
    download.addEventListener("click", () => {
      const blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "statatlas-indonesia-series.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      download.textContent = "Downloaded — statatlas-indonesia-series.csv";
    });
  }
}

// The province table: filter by the search box, then sort by the chosen
// column. Density is people per square kilometre, computed from the
// population and area in the dataset.
function filteredProvinces() {
  const rows = PROVINCES.map((p) => ({
    ...p,
    density: Math.round((p.population * 1000000) / p.area),
  }));
  const query = provinceState.query;
  const kept = query
    ? rows.filter((p) => `${p.name} ${p.capital} ${p.island}`.toLowerCase().includes(query))
    : rows;
  const { sortKey, sortDir } = provinceState;
  kept.sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number") return (av - bv) * sortDir;
    return String(av).localeCompare(String(bv)) * sortDir;
  });
  return kept;
}

function renderProvinceTable() {
  const table = document.getElementById("province-table");
  if (!table) return;
  const rows = filteredProvinces();
  table.querySelector("tbody").innerHTML = rows.length
    ? rows.map((p) =>
        `<tr><td><strong>${p.name}</strong></td><td>${p.capital}</td><td>${p.island}</td>` +
        `<td class="num">${p.population.toFixed(2)}</td>` +
        `<td class="num">${p.area.toLocaleString("en-US")}</td>` +
        `<td class="num">${p.density.toLocaleString("en-US")}</td></tr>`).join("")
    : `<tr><td colspan="6">No province matches that search.</td></tr>`;
  const count = document.getElementById("province-count");
  if (count) {
    count.textContent = rows.length === PROVINCES.length
      ? `Showing all ${PROVINCES.length} largest provinces.`
      : `Showing ${rows.length} of ${PROVINCES.length} provinces.`;
  }
  table.querySelectorAll("th[data-sort]").forEach((th) => {
    th.classList.toggle("sorted", th.dataset.sort === provinceState.sortKey);
    th.onclick = () => {
      const key = th.dataset.sort;
      if (provinceState.sortKey === key) {
        provinceState.sortDir *= -1;
      } else {
        const textKey = key === "name" || key === "capital" || key === "island";
        provinceState.sortKey = key;
        provinceState.sortDir = textKey ? 1 : -1;
      }
      renderProvinceTable();
    };
  });
}

window.addEventListener("hashchange", showPage);
showPage();
