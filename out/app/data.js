// StatAtlas dataset: Indonesia in Numbers.
//
// Every figure here is a published official statistic. The source of each
// series is named next to it, and the Sources & Methods page of the site
// carries the full citations, vintages and definitions. Values are rounded
// to the precision the site displays; nothing here is estimated by the site
// itself, except where a note says a published total was split into bands.

export const COUNTRY = {
  name: "Indonesia",
  officialName: "Republic of Indonesia",
  capital: "Jakarta",
  newCapital: "Nusantara (under construction, East Kalimantan)",
  areaKm2: 1904569,
  islands: 17508,
  provinces: 38,
  currency: "Indonesian rupiah (IDR)",
  language: "Indonesian (Bahasa Indonesia)",
  independence: "17 August 1945",
  government: "Presidential republic",
  timeZones: "WIB (UTC+7), WITA (UTC+8), WIT (UTC+9)",
  callingCode: "+62",
  domain: ".id",
};

// Turn compact [year, value] rows into labelled points the charts can use.
function series(rows, unit) {
  return rows.map(([year, value]) => ({ year, value, unit }));
}

// Headline indicators for the Overview page. Each one carries the year it
// refers to and the agency that published it.
export const HEADLINES = [
  { label: "Population", value: "283.5 million", note: "4th largest in the world", year: "2024", source: "World Bank, WDI" },
  { label: "GDP", value: "$1,396 billion", note: "16th largest economy", year: "2024", source: "World Bank, WDI" },
  { label: "GDP per capita", value: "$4,925", note: "Upper-middle income", year: "2024", source: "World Bank, WDI" },
  { label: "GDP growth", value: "5.03%", note: "Real, year on year", year: "2024", source: "World Bank / BPS" },
  { label: "Unemployment", value: "4.76%", note: "Open unemployment rate", year: "Feb 2025", source: "BPS, Sakernas" },
  { label: "Poverty rate", value: "8.57%", note: "24.06 million people", year: "Sep 2024", source: "BPS, Susenas" },
  { label: "Life expectancy", value: "71.3 years", note: "At birth", year: "2024", source: "World Bank, WDI" },
  { label: "Inflation", value: "1.57%", note: "Consumer prices, Dec to Dec", year: "2024", source: "BPS" },
];

// Real GDP growth, annual percent.
// World Bank WDI (NY.GDP.MKTP.KD.ZG), cross-checked against BPS releases.
export const GDP_GROWTH = series([
  [2015, 4.88], [2016, 5.03], [2017, 5.07], [2018, 5.17], [2019, 5.02],
  [2020, -2.07], [2021, 3.70], [2022, 5.31], [2023, 5.05], [2024, 5.03],
], "%");

// Nominal GDP in current US dollars, billions. World Bank WDI (NY.GDP.MKTP.CD).
export const GDP_NOMINAL = series([
  [2015, 860.9], [2016, 931.9], [2017, 1015.6], [2018, 1042.3], [2019, 1119.1],
  [2020, 1059.1], [2021, 1186.5], [2022, 1319.1], [2023, 1371.2], [2024, 1396.3],
], "US$ bn");

// Nominal GDP in trillion rupiah at current prices. BPS national accounts.
export const GDP_IDR = series([
  [2015, 11543.0], [2016, 12401.7], [2017, 13589.8], [2018, 14838.8], [2019, 15832.7],
  [2020, 15443.4], [2021, 16976.8], [2022, 19588.5], [2023, 20892.4], [2024, 22139.0],
], "IDR trn");

// Population in millions. World Bank WDI (SP.POP.TOTL).
export const POPULATION = series([
  [2015, 258.2], [2016, 261.1], [2017, 264.0], [2018, 266.9], [2019, 269.6],
  [2020, 271.9], [2021, 274.9], [2022, 277.5], [2023, 281.2], [2024, 283.5],
], "million");

// Population by age group, percent of the total population, 2024.
// World Bank WDI; the 0-14 and 65+ bands are published, and the 15-64 total
// of 68.1 percent is split into the three working-age bands below.
export const AGE_GROUPS = [
  { group: "0-14", share: 24.6, note: "Children" },
  { group: "15-24", share: 16.6, note: "Youth" },
  { group: "25-54", share: 43.2, note: "Prime working age" },
  { group: "55-64", share: 8.3, note: "Older workers" },
  { group: "65+", share: 7.3, note: "Seniors" },
];

// Poverty rate, percent of the population, September each year.
// BPS, National Socio-Economic Survey (Susenas).
export const POVERTY = series([
  [2019, 9.22], [2020, 10.19], [2021, 9.71], [2022, 9.57],
  [2023, 9.03], [2024, 8.57], [2025, 8.25],
], "%");

// Open unemployment rate, percent of the labour force.
// BPS, National Labour Force Survey (Sakernas).
export const UNEMPLOYMENT = [
  { label: "Aug 2019", value: 5.23 }, { label: "Aug 2020", value: 7.07 },
  { label: "Aug 2021", value: 6.49 }, { label: "Aug 2022", value: 5.86 },
  { label: "Aug 2023", value: 5.32 }, { label: "Feb 2024", value: 4.82 },
  { label: "Aug 2024", value: 4.91 }, { label: "Feb 2025", value: 4.76 },
];

// Labour market snapshot, February 2025. BPS, Sakernas.
export const LABOUR = {
  labourForce: "153.05 million",
  employed: "145.77 million",
  unemployed: "7.28 million",
  participation: "70.6%",
  informalShare: "59.4%",
  fullTimeShare: "66.2%",
};

// Employment by sector, share of all employed people, February 2025.
// BPS, Sakernas (rounded).
export const EMPLOYMENT_SECTORS = [
  { name: "Agriculture, forestry & fishing", share: 28.4 },
  { name: "Wholesale & retail trade", share: 18.8 },
  { name: "Manufacturing", share: 14.0 },
  { name: "Construction", share: 6.9 },
  { name: "Accommodation & food services", share: 6.8 },
  { name: "All other services", share: 25.1 },
];

// GDP by sector, share of GDP at current prices, 2024. BPS (rounded).
export const GDP_SECTORS = [
  { name: "Manufacturing", share: 18.7 },
  { name: "Wholesale & retail trade", share: 12.9 },
  { name: "Agriculture, forestry & fishing", share: 12.5 },
  { name: "Construction", share: 10.0 },
  { name: "Mining & quarrying", share: 8.6 },
  { name: "All other sectors", share: 37.3 },
];

// Exports and imports of goods, US$ billions. BPS foreign trade statistics.
export const TRADE = [
  { year: 2015, exports: 150.4, imports: 142.7 },
  { year: 2016, exports: 145.2, imports: 135.7 },
  { year: 2017, exports: 168.8, imports: 156.9 },
  { year: 2018, exports: 180.0, imports: 188.7 },
  { year: 2019, exports: 167.7, imports: 171.3 },
  { year: 2020, exports: 163.2, imports: 141.6 },
  { year: 2021, exports: 231.6, imports: 196.2 },
  { year: 2022, exports: 291.9, imports: 237.5 },
  { year: 2023, exports: 258.8, imports: 221.9 },
  { year: 2024, exports: 264.7, imports: 233.7 },
];

// Consumer price inflation, December to December, percent. BPS.
export const INFLATION = series([
  [2015, 3.35], [2016, 3.02], [2017, 3.61], [2018, 3.13], [2019, 2.72],
  [2020, 1.68], [2021, 1.87], [2022, 5.51], [2023, 2.61], [2024, 1.57],
], "%");

// The 15 largest provinces by population, 2024. BPS estimates.
// Population in millions; area in square kilometres.
export const PROVINCES = [
  { name: "West Java", capital: "Bandung", island: "Java", population: 50.35, area: 35378 },
  { name: "East Java", capital: "Surabaya", island: "Java", population: 41.81, area: 47803 },
  { name: "Central Java", capital: "Semarang", island: "Java", population: 37.89, area: 32801 },
  { name: "North Sumatra", capital: "Medan", island: "Sumatra", population: 15.59, area: 72981 },
  { name: "Banten", capital: "Serang", island: "Java", population: 12.43, area: 9663 },
  { name: "Jakarta", capital: "Jakarta", island: "Java", population: 10.68, area: 664 },
  { name: "South Sulawesi", capital: "Makassar", island: "Sulawesi", population: 9.51, area: 46717 },
  { name: "Lampung", capital: "Bandar Lampung", island: "Sumatra", population: 9.43, area: 34624 },
  { name: "South Sumatra", capital: "Palembang", island: "Sumatra", population: 8.98, area: 91592 },
  { name: "Riau", capital: "Pekanbaru", island: "Sumatra", population: 6.63, area: 87024 },
  { name: "West Sumatra", capital: "Padang", island: "Sumatra", population: 5.92, area: 42013 },
  { name: "West Kalimantan", capital: "Pontianak", island: "Kalimantan", population: 5.91, area: 147307 },
  { name: "Bali", capital: "Denpasar", island: "Bali", population: 4.41, area: 5780 },
  { name: "South Kalimantan", capital: "Banjarmasin", island: "Kalimantan", population: 4.29, area: 38744 },
  { name: "East Kalimantan", capital: "Samarinda", island: "Kalimantan", population: 4.17, area: 127347 },
];

// Human development and wellbeing indicators. Sources noted per indicator.
export const WELLBEING = [
  { label: "Human Development Index", value: "75.02", note: "BPS composite index, 0-100 scale", year: "2024", source: "BPS" },
  { label: "Gini ratio", value: "0.379", note: "Income inequality, 0 = perfect equality", year: "2024", source: "BPS" },
  { label: "Life expectancy", value: "71.3 years", note: "At birth", year: "2024", source: "World Bank" },
  { label: "Infant mortality", value: "17.9", note: "Deaths per 1,000 live births", year: "2024", source: "World Bank" },
  { label: "Maternal mortality", value: "140", note: "Deaths per 100,000 live births", year: "2023", source: "World Bank" },
  { label: "Health spending", value: "2.7%", note: "Share of GDP", year: "2023", source: "World Bank" },
  { label: "Mean years of schooling", value: "9.0 years", note: "Population aged 25 and over", year: "2024", source: "BPS" },
  { label: "Adult literacy", value: "96.5%", note: "Population aged 15 and over", year: "2023", source: "BPS" },
  { label: "Internet users", value: "72.8%", note: "Share of the population", year: "2024", source: "World Bank" },
  { label: "Urban population", value: "58.8%", note: "Share living in urban areas", year: "2024", source: "World Bank" },
  { label: "Fertility rate", value: "2.12", note: "Children per woman", year: "2024", source: "World Bank" },
  { label: "Foreign visitors", value: "13.9 million", note: "International tourist arrivals", year: "2024", source: "BPS" },
];

// Trade and finance snapshot, 2024. Sources: BPS, Bank Indonesia, World Bank.
export const TRADE_SNAPSHOT = [
  { label: "Exports of goods", value: "$264.7 bn", year: "2024", source: "BPS" },
  { label: "Imports of goods", value: "$233.7 bn", year: "2024", source: "BPS" },
  { label: "Trade balance", value: "+$31.0 bn", year: "2024", source: "BPS" },
  { label: "Foreign direct investment", value: "$24.2 bn", year: "2024", source: "World Bank" },
  { label: "Foreign exchange reserves", value: "$155.7 bn", year: "Dec 2024", source: "Bank Indonesia" },
  { label: "Exchange rate", value: "15,855 IDR / USD", year: "2024 average", source: "World Bank" },
];

// Key dates in the statistical calendar, as published by BPS.
export const RELEASE_CALENDAR = [
  { date: "5 Feb 2026", release: "GDP, fourth quarter 2025", agency: "BPS" },
  { date: "5 May 2026", release: "GDP, first quarter 2026", agency: "BPS" },
  { date: "5 Aug 2026", release: "GDP, second quarter 2026", agency: "BPS" },
  { date: "5 Nov 2026", release: "GDP, third quarter 2026", agency: "BPS" },
  { date: "Monthly", release: "Consumer Price Index and inflation", agency: "BPS" },
  { date: "February / August", release: "Labour Force Survey (Sakernas)", agency: "BPS" },
  { date: "March / September", release: "Poverty profile", agency: "BPS" },
  { date: "Annual", release: "Human Development Index", agency: "BPS" },
];

// Sources cited across the site.
export const SOURCES = [
  { short: "BPS", full: "Statistics Indonesia (Badan Pusat Statistik) — bps.go.id", note: "National accounts, Susenas, Sakernas, population estimates, CPI, HDI." },
  { short: "World Bank, WDI", full: "World Bank, World Development Indicators — data.worldbank.org", note: "GDP, population, life expectancy, health and connectivity indicators." },
  { short: "Bank Indonesia", full: "Bank Indonesia — bi.go.id", note: "Foreign exchange reserves and monetary statistics." },
  { short: "UN WPP", full: "United Nations, World Population Prospects 2024", note: "Population structure and projections." },
];

export const DATA_NOTE =
  "Figures on this site are the latest published values available when the site was built (November 2026). " +
  "Values are rounded to the precision shown; the underlying series are published by the agencies listed " +
  "on the Sources & Methods page. Where two agencies publish different values for the same concept " +
  "(for example population), the site names the source next to the figure.";
