import { z } from "zod";
import { ConfigBase } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";

export const $Layout = ConfigBase("Layout")
  .extend({
    name: z.string(),
    contentBlocks: z.array(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        type: z.enum(["TEXT", "IMAGE"]),
        maxLength: z.number(),
      }),
    ),
  })
  .describe("Layout");

export type Layout = z.infer<typeof $Layout>;
export type LayoutId = Layout["id"];
