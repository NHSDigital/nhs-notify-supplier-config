import { z } from "zod";

export function ConfigBase<T extends string>(type: T) {
  return z.object({
    id: z.string().brand<T>(type),
  });
}

export const $Semver = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/)
  .brand("Version");
export const Version = $Semver.parse;
