# StatAtlas — Indonesia in Numbers

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/nonicon/statatlas/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/nonicon/statatlas/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

**StatAtlas** is a national statistics site for Indonesia: the essential facts about the world's fourth most populous country — its people, its economy, its labour market, its wellbeing and its regions — drawn from Statistics Indonesia (BPS) and the World Bank, with every figure's source and year named beside it.

## What it covers

- **Overview** — eight headline indicators (population, GDP, growth, unemployment, poverty, life expectancy, inflation) with trend sparklines, plus growth and population charts and country facts.
- **Economy** — nominal GDP in US dollars or rupiah (switchable), real GDP growth, GDP by sector, exports, inflation, and a trade & finance snapshot.
- **Population** — population growth 2015–2024, age structure, and the ten largest provinces.
- **Work** — labour force, unemployment trend, employment by sector, and how to read the informal economy.
- **Wellbeing** — poverty trend 2019–2025, HDI, Gini, health and education indicators.
- **Regions** — a searchable, sortable table of the 15 largest provinces with population, area and density.
- **Sources & methods** — every source in full, definitions, the release calendar, and a one-click CSV download of every series charted on the site.

## How it works

The site is plain static files under `app/` — no build step, no network requests, no framework. Charts are hand-drawn SVG generated in the browser from the dataset in `app/data.js`. It works on desktop and on a phone.

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

## Data

All figures are the latest published values available in November 2026, republished with their sources named. Where two agencies publish different values for the same concept (for example population), the site names the source next to the figure. See the Sources & methods page in the site for the full list.

StatAtlas is an independent reference site, not affiliated with Statistics Indonesia, the World Bank or the Government of Indonesia.
