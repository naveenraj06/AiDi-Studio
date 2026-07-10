import * as React from "react";
import type { WidgetType } from "@/types";

export type LiveSource = "weather-temp" | "weather-wind" | "weather-current" | "news-table";

/**
 * The sample "Weather & News Sample" project's widgets aren't tagged with a
 * dedicated column — we derive which free API backs a widget from its
 * resource name + chart type, both of which the API already returns.
 */
export function deriveLiveSource(resourceName: string | null | undefined, type: WidgetType): LiveSource | undefined {
  if (resourceName === "Open-Meteo Weather") {
    if (type === "line") return "weather-temp";
    if (type === "bar") return "weather-wind";
    if (type === "stat") return "weather-current";
  }
  if (resourceName === "Hacker News Top Stories" && type === "table") return "news-table";
  return undefined;
}

// Both APIs are free, keyless, and CORS-enabled, so they can be called straight
// from the browser — no backend proxy needed for this sample project.
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,wind_speed_10m_max&timezone=auto&forecast_days=6";
const HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const hnItemUrl = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

export interface WeatherForecast {
  current: { temperature_2m: number; wind_speed_10m: number };
  daily: { time: string[]; temperature_2m_max: number[]; wind_speed_10m_max: number[] };
}

export interface NewsStory {
  id: number;
  title: string;
  score: number;
  by: string;
  descendants: number;
}

let weatherPromise: Promise<WeatherForecast> | null = null;
function fetchWeather(): Promise<WeatherForecast> {
  if (!weatherPromise) {
    weatherPromise = fetch(WEATHER_URL).then((res) => {
      if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);
      return res.json();
    });
  }
  return weatherPromise;
}

let newsPromise: Promise<NewsStory[]> | null = null;
function fetchNews(): Promise<NewsStory[]> {
  if (!newsPromise) {
    newsPromise = fetch(HN_TOP_STORIES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Hacker News request failed: ${res.status}`);
        return res.json() as Promise<number[]>;
      })
      .then((ids) => Promise.all(ids.slice(0, 5).map((id) => fetch(hnItemUrl(id)).then((res) => res.json()))));
  }
  return newsPromise;
}

/** Fetches once per session (module-level cache) and only when `enabled` — keeps unrelated widgets from triggering network calls. */
export function useLiveWeather(enabled: boolean) {
  const [data, setData] = React.useState<WeatherForecast | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchWeather()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, error };
}

export function useLiveNews(enabled: boolean) {
  const [data, setData] = React.useState<NewsStory[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchNews()
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, error };
}
