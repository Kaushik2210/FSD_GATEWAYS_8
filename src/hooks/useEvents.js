import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { events as staticEvents } from "../data/events";

// Falls back to the bundled static list if the backend isn't running —
// keeps the site fully usable in frontend-only dev.
export function useEvents() {
  const [events, setEvents] = useState(staticEvents);

  useEffect(() => {
    let cancelled = false;
    apiGet("/events")
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setEvents(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}
