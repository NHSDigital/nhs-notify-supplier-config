import { z } from "zod";

export function ConfigBase<T extends string>(type: T) {
  return z.object({
    id: z.string().brand<T>(type),
  });
}

export const $Version = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/)
  .brand("Version");
export type Version = z.infer<typeof $Version>;
