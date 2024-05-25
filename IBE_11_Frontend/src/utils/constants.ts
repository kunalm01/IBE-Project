export const translationUrl =
  "https://team-11-ibe-apim.azure-api.net/api/v1/translation";

export const propertyUrl =
  "https://team-11-ibe-apim.azure-api.net/api/v1/property";

export const minimumRatesUrl = `https://team-11-ibe-apim.azure-api.net/api/v1/nightly-rate?startDate=${
  new Date().toISOString().split("T")[0]
}&endDate=2024-06-30`;

const currencyApiKey = import.meta.env.VITE_CURRENCY_API_KEY;
export const currencyUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${currencyApiKey}`;

const tenantId = import.meta.env.VITE_TENANT_ID;
export const configUrl = `https://team-11-ibe-apim.azure-api.net/api/v1/config/${tenantId}`;

export const getRoomUrl = (pageNumber: number, pageSize: number) => {
  return `https://team-11-ibe-apim.azure-api.net/api/v1/room?pageNumber=${pageNumber}&pageSize=${pageSize}`;
};
