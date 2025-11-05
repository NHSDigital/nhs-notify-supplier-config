import { ConfigBase } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";
import { idRef } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/helpers/id-ref";
import { $PackSpecification } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/pack-specification";
import { z } from "zod";

export const $LetterType = z.enum([
  "LETTER_STANDARD",
  "LETTER_BRAILLE",
  "LETTER_AUDIO",
  "LETTER_SAME_DAY",
]);

export const $LetterVariant = ConfigBase("LetterVariant")
  .extend({
    name: z.string(),
    description: z.string().optional(),
    letterType: $LetterType,
    status: z.enum(["DRAFT", "PUBLISHED", "DISABLED"]),
    clientId: z.string().optional(),
    campaignIds: z.array(z.string()).optional(),
    packSpecificationIds: z.array(idRef($PackSpecification)).nonempty(),
  })
  .describe("LetterVariant");
export type LetterVariant = z.infer<typeof $LetterVariant>;
export const LetterVariantId = $LetterVariant.shape.id.parse;
