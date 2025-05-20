import {
  fetchCzechCities,
  fetchCountriesCurrencies,
  fetchCountriesCurrenciesDials,
  fetchCzechFlag,
  fetchCountryPopulation,
  fetchCityPopulation,
  fetchNFirstCities,
} from "./api";
import { prettyPrintNumber, zip } from "./utils";

// Mark template literal as html string
const html = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw({ raw: strings }, ...values);

// Render population of Czech Republic
export const showPopulation = async () => {
  const population = await fetchCountryPopulation("Czech Republic");

  return html`<p>Population of Czech Republic: ${prettyPrintNumber(population)}</p>`;
};

const renderList = (items: string[]) => {
  return html`<ul class="list min-w-sm">
    ${items.map((item) => html`<li class="list-row">${item}</li>`).join("\n")}
  </ul>`;
};

// Render all cities of Czech Republic
export const showCities = async () => renderList(await fetchCzechCities());

// Render first 3 cities of Czech Republic
export const showFirst3Cities = async () =>
  renderList(await fetchNFirstCities("Czech Republic", 3));

//Render the flag of Czech Republic
export const showFlag = async () => {
  const flag = await fetchCzechFlag();

  // Render flag URL and image
  return html`<p>URL: ${flag}</p>
<img class="max-w-lg" src="${flag}" alt="Flag of Czech Republic" />`;
};

// Render currencies of all countries
export const showCountriesCurrencies = async () => {
  // Fetch currencies and filter out empty currencies
  const currencies = await fetchCountriesCurrencies();

  // Sort currencies by name
  currencies.sort((a, b) => a.name.localeCompare(b.name));

  return renderList(
    currencies.map(
      (country) => html`
        <span class="list-col-grow">${country.name}</span>
        <span>${country.currency}</span>
      `,
    ),
  );
};

// Render currencies and dial codes of all countries
export const showCountriesCurrenciesDials = async () => {
  const countries = await fetchCountriesCurrenciesDials();

  // Sort countries by name
  countries.sort((a, b) => a.name.localeCompare(b.name));

  return renderList(
    countries.map(
      ({ name, currency, dialCode }) => html`
        <span class="list-col-grow">${name}</span>
        <span>${currency}</span>
        <span class="min-w-16 text-right">${dialCode}</span>
      `,
    ),
  );
};

// Render items ordered by population
const showCompared = async (
  names: string[],
  fetcher: (name: string) => Promise<number>,
) => {
  const populations = await Promise.all(names.map((name) => fetcher(name)));

  const pairs = zip(names, populations);

  pairs.sort(([_aName, aPop], [_bName, bPop]) => bPop - aPop);

  return renderList(
    pairs.map(
      ([name, population]) => html`
        <span class="list-col-grow">${name}</span>
        <span>${prettyPrintNumber(population)}</span>
      `,
    ),
  );
};

// Render countries ordered by population
export const showCountriesCompared = async () =>
  showCompared(
    ["Czech Republic", "Germany", "Austria", "Poland", "Slovak Republic"],
    fetchCountryPopulation,
  );

// Render cities ordered by population
export const showCitiesCompared = async () =>
  showCompared(["Plzen", "Praha", "Ostrava", "Brno"], fetchCityPopulation);
