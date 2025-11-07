import { z } from "zod";

const $Config = z.object({
  EVENT_ENV: z.string().default("dev"),
  EVENT_SERVICE: z.string().default("events"),
});
export type Config = z.infer<typeof $Config>;

export const configFromEnv = () => {
  return $Config.parse(process.env);
};

export const buildEventSource = (config: Config) => {
  const { EVENT_ENV, EVENT_SERVICE } = config;
  return `/control-plane/supplier-config/${EVENT_ENV}/${EVENT_SERVICE}`;
};
