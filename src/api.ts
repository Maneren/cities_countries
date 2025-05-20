class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = "https://countriesnow.space/api/v0.1";

const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(`${BASE_URL}/${url}`, options);

  const data = await response.json();

  if (data.error) {
    throw new ApiError(data.msg);
  }

  return data;
};

// POST json data to the C&C API and return the response
const apiPost = async (url: string, data?: object) => {
  return await apiRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
};

// GET json data from the C&C API
const apiGet = async (url: string) => {
  return apiRequest(url, { method: "GET" });
};

// Throw error if data is undefined
const assertDataExists = <T>(data: T | undefined, errorMessage: string): T => {
  if (!data) {
    throw new ApiError(errorMessage);
  }
  return data;
};

// Find the latest data by year
const findLatestByYear = <T extends { year: number }>(data: T[]) => {
  return data.reduce((a, b) => (a.year > b.year ? a : b));
};

// Fetch population of a country
export const fetchCountryPopulation = async (
  country: string,
): Promise<number> => {
  const response = await apiPost(`countries/population`, { country });

  const populationCounts: { year: number; value: number }[] = assertDataExists(
    response?.data?.populationCounts,
    "No population data returned",
  );

  return findLatestByYear(populationCounts).value;
};

// Fetch population of a city
export const fetchCityPopulation = async (city: string): Promise<number> => {
  const response = await apiPost(`countries/population/cities`, { city });

  const populationCounts = assertDataExists(
    response?.data?.populationCounts as { year: number; value: number }[],
    "No population data returned",
  );

  return findLatestByYear(populationCounts).value;
};

// Fetch all cities of Czech Republic
export const fetchCzechCities = async (): Promise<string[]> => {
  const response = await apiPost(`countries/cities`, {
    country: "Czech Republic",
  });

  return assertDataExists(response?.data as string[], "No cities returned");
};

export const fetchNFirstCities = async (
  country: string,
  limit: number,
): Promise<string[]> => {
  const response = await apiPost(`countries/population/cities/filter`, {
    limit,
    order: "asc",
    orderBy: "name",
    country,
  });

  return assertDataExists(
    response?.data as { city: string }[],
    "No cities returned",
  ).map((city) => city.city);
};

//Fetch the flag of Czech Republic
export const fetchCzechFlag = async (): Promise<string> => {
  const response = await apiPost(`countries/flag/images`, {
    iso2: "cz",
  });

  return assertDataExists(response?.data?.flag as string, "No flag returned");
};

// Fetch currencies of all countries
export const fetchCountriesCurrencies = async (): Promise<
  {
    name: string;
    currency: string;
  }[]
> => {
  const response = await apiGet(`countries/currency`);

  return assertDataExists(
    response?.data as {
      name: string;
      currency: string;
    }[],
    "No currencies returned",
  ).filter((country) => country.currency);
};

// Fetch currencies and dial codes of all countries
export const fetchCountriesCurrenciesDials = async (): Promise<
  {
    name: string;
    currency: string;
    dialCode: string;
  }[]
> => {
  const currencies = await fetchCountriesCurrencies();

  const dialCodesResponse = await apiGet(`countries/codes`);

  const dialCodes = assertDataExists(
    dialCodesResponse?.data as {
      name: string;
      dial_code: string;
    }[],
    "No dial codes returned",
  );

  const countriesMap = new Map<
    string,
    { currency: string | null; dialCode: string | null }
  >();

  dialCodes.forEach(({ name, dial_code }) => {
    countriesMap.set(name, { currency: null, dialCode: dial_code });
  });

  currencies.forEach(({ name, currency }) => {
    if (!countriesMap.has(name)) {
      countriesMap.set(name, { currency, dialCode: null });
    } else {
      countriesMap.get(name)!.currency = currency;
    }
  });

  // remove countries without currency or dial code
  const filtered = Array.from(countriesMap.entries()).flatMap(
    ([name, { currency, dialCode }]) => {
      // we want to also filter other falsy values like empty strings, so the
      // weak check is ok here
      if (!(currency && dialCode)) return [];

      return [{ name, currency, dialCode }];
    },
  );

  return filtered;
};
