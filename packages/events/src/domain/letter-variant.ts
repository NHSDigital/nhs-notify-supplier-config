import { ConfigBase } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";
import { idRef } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/helpers/id-ref";
import {
  $Constraints,
  $PackSpecification
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { z } from "zod";
import { $Contract } from "./contract";

export const $LetterType = z.enum([
  "STANDARD",
  "BRAILLE",
  "AUDIO",
  "SAME_DAY",
]);

export const $LetterVariantStatus = z.enum(["DRAFT", "PUBLISHED", "DISABLED"]);

export const $LetterVariant = ConfigBase("LetterVariant")
  .extend({
    name: z.string(),
    description: z.string().optional(),
    type: $LetterType,
    status: $LetterVariantStatus,
    contractId: idRef($Contract),
    clientId: z.string().optional(),
    campaignIds: z.array(z.string()).optional(),
    packSpecificationIds: z.array(idRef($PackSpecification)).nonempty(),
    constraints: $Constraints.optional().meta({
      title: "LetterVariant Constraints",
      description:
        "Constraints that apply to this letter variant, aggregating those in the pack specifications where specified.",
    }),
  })
  .describe("LetterVariant");
export type LetterVariant = z.infer<typeof $LetterVariant>;
export const LetterVariantId = $LetterVariant.shape.id.parse;
