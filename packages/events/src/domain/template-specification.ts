import { z } from "zod";
import { ConfigBase } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";
import { idRef } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/helpers/id-ref";
import {
  $PackSpecification,
  $SpecificationStatus,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/pack-specification";

export const $SpecificationType = z.enum([
  "LETTER_STANDARD",
  "LETTER_BRAILLE",
  "LETTER_AUDIO",
  "LETTER_SAME_DAY",
]);

export const $TemplateSpecification = ConfigBase("TemplateSpecification")
  .extend({
    name: z.string(),
    description: z.string().optional(),
    specificationType: $SpecificationType,
    status: $SpecificationStatus,
    clientId: z.string().optional(),
    campaignIds: z.array(z.string()).optional(),
    packSpecificationIds: z.array(idRef($PackSpecification)).nonempty(),
  })
  .describe("TemplateSpecification");
export type TemplateSpecification = z.infer<typeof $TemplateSpecification>;
export const TemplateSpecificaitonId = $TemplateSpecification.shape.id.parse;
