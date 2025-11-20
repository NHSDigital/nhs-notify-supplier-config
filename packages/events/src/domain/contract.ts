import { z } from "zod";
import { ConfigBase } from "./common";

export const $Contract = ConfigBase("Contract")
  .extend({
    name: z.string(),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "DISABLED"]),
    startDate: z.iso.date(), // ISO date
    endDate: z.iso.date().optional(), // ISO date
  })
  .meta({
    title: "Contract",
    description:
      "An individual contract under which suppliers will be allocated capacity.",
  });
export type Contract = z.infer<typeof $Contract>;
export const ContractId = $Contract.shape.id.parse;
