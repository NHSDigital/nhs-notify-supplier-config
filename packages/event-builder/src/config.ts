import { z } from "zod";

const $Config = z.object({
  EVENT_ENV: z.string().default("dev"),
  EVENT_SERVICE: z.string().default("events"),
});

export const loadConfig = () => {
  // Merge defaults with process.env then parse
  return $Config.parse({
    EVENT_ENV: process.env.EVENT_ENV,
    EVENT_SERVICE: process.env.EVENT_SERVICE,
  });
};

export const buildEventSource = () => {
  const { EVENT_ENV, EVENT_SERVICE } = loadConfig();
  return `/control-plane/supplier-config/${EVENT_ENV}/${EVENT_SERVICE}`;
};

// Backwards compatibility export (deprecated)
export const eventSource = buildEventSource();
