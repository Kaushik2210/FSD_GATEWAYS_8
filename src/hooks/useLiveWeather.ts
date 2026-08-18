import { useEffect, useState } from "react";
import { fetchLiveWeather } from "../lib/weather";

export function useLiveWeather() {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveWeather(controller.signal)
      .then((result) => {
        setWeather(result);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => controller.abort();
  }, []);

  return { weather, status };
}
