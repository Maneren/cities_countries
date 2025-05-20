import {
  showFirst3Cities,
  showCities,
  showCitiesCompared,
  showCountriesCompared,
  showCountriesCurrencies,
  showCountriesCurrenciesDials,
  showFlag,
  showPopulation,
  HtmlString,
} from "./render";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<header class="container mx-auto my-8 items-center flex flex-col">
  <h1 class="text-4xl font-bold text-center">
    Countries &amp; Cities API client
  </h1>
</header>
<main class="container mx-auto items-center flex flex-col">
  <select
    id="function-selection"
    class="select select-bordered w-full max-w-md"
  >
    <option value="population-cz" selected>
      Get population of Czech Republic
    </option>
    <option value="cities-cz">Get all cities of Czech Republic</option>
    <option value="cities-cz-3">Get 3 cities of Czech Republic</option>
    <option value="flag-cz">Get flag of Czech Republic</option>
    <option value="countries-currencies">
      Get currencies of all countries
    </option>
    <option value="countries-currencies-dials">
      Get currencies and dial codes of all countries
    </option>
    <option value="countries-compare">
      Compare populations for Czech Republic and neighbor countries
    </option>
    <option value="cities-compare">
      Compare populations of Plzeň, Praha, Ostrava, and Brno
    </option>
  </select>
  <div id="result" class="my-8 flex flex-col items-center w-md">
    <span
      id="loading-spinner"
      class="loading loading-spinner loading-xl"
    ></span>
    <div
      id="result-placeholder"
      class="flex flex-col items-center gap-2 w-full"
    ></div>
  </div>
</main>
`;

const handlers: Record<string, () => Promise<HtmlString>> = {
  "population-cz": showPopulation,
  "cities-cz": showCities,
  "cities-cz-3": showFirst3Cities,
  "flag-cz": showFlag,
  "countries-currencies": showCountriesCurrencies,
  "countries-currencies-dials": showCountriesCurrenciesDials,
  "countries-compare": showCountriesCompared,
  "cities-compare": showCitiesCompared,
};

const RESULT = document.querySelector<HTMLDivElement>("#result-placeholder")!;

const showSpinner = (show: boolean) => {
  const spinner = document.querySelector<HTMLDivElement>("#loading-spinner")!;
  spinner.style.display = show ? "block" : "none";
};

const clearResult = () => {
  showSpinner(true);
  RESULT.innerHTML = "";
};

const showResult = (html: HtmlString) => {
  showSpinner(false);
  RESULT.innerHTML = html.toString();
};

const runHandler = async (handlerName: string) => {
  if (!handlers[handlerName]) {
    return;
  }

  clearResult();

  try {
    showResult(await handlers[handlerName]());
  } catch (error) {
    console.error(error);
    showResult((error as Error).message);
    return;
  }
};

const setupHandlers = (element: HTMLSelectElement) => {
  element.addEventListener("change", () => runHandler(element.value));
};

setupHandlers(
  document.querySelector<HTMLSelectElement>("#function-selection")!,
);

runHandler("population-cz");
