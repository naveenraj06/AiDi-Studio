import { ApiResource } from "./types";

export const apiResources: ApiResource[] = [
  { id: "res-1", name: "Sales Summary", url: "api.stripe.com/v1/charges", method: "GET", authType: "Bearer", status: "healthy", usedByCount: 4, lastTested: "2 min ago" },
  { id: "res-2", name: "Orders Feed", url: "api.shopify.com/orders", method: "GET", authType: "API Key", status: "healthy", usedByCount: 3, lastTested: "5 min ago" },
  { id: "res-3", name: "GitHub Repos", url: "api.github.com/user/repos", method: "GET", authType: "Bearer", status: "healthy", usedByCount: 2, lastTested: "1 hr ago" },
  { id: "res-4", name: "HubSpot Contacts", url: "api.hubapi.com/contacts", method: "GET", authType: "OAuth", status: "error", usedByCount: 1, lastTested: "3 hrs ago" },
  { id: "res-5", name: "Weather Data", url: "api.openweather.org/data", method: "GET", authType: "API Key", status: "healthy", usedByCount: 0, lastTested: "Never" },
];
