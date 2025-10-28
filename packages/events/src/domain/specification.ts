import {z} from "zod";
import {
  $Version,
  ConfigBase,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";
import idRef from "@nhsdigital/nhs-notify-schemas-supplier-config/src/helpers/id-ref";

export const $SpecificationType = z.enum([
  "LETTER_STANDARD",
  "LETTER_BRAILLE",
  "LETTER_AUDIO",
  "LETTER_SAME_DAY",
]);
export const $SpecificationFeature = z.enum(["MAILMARK"]);
export const $EnvelopeFeature = z.enum([
  "WHITEMAIL",
  "NHS_BRANDING",
  "NHS_BARCODE",
]);
const $SpecificationStatus = z.enum(["DRAFT", "PUBLISHED", "DISABLED"]);

export const $Envelope = ConfigBase("Envelope")
  .extend({
    name: z.string(),
    size: z.enum(["C5", "C4", "DL"]),
    features: z.array($EnvelopeFeature).optional(),
  })
  .describe("Envelope");
export type Envelope = z.infer<typeof $Envelope>;
export const EnvelopeId = $Envelope.shape.id.parse;

export const $Insert = ConfigBase("Insert")
  .extend({
    name: z.string(),
    type: z.enum(["FLYER", "BOOKLET"]),
    source: z.enum(["IN_HOUSE", "EXTERNAL"]),
    artwork: z.url().optional(),
  })
  .describe("Insert");
export type Insert = z.infer<typeof $Insert>;
export type InsertId = Insert["id"];

export const $Specification = ConfigBase("Specification")
  .extend({
    name: z.string(),
    status: $SpecificationStatus,
    specificationType: $SpecificationType,
    createdAt: z.date(),
    updatedAt: z.date(),
    version: $Version,
    billing: z
      .object({
        basePrice: z.number(),
        unitPrice: z.number(),
      })
      .partial()
      .optional(),
    postage: z
      .object({
        tariff: z.string(),
        size: z.string(),
        deliverySLA: z.number(),
        maxSheets: z.number(),
        maxWeight: z.number().optional(),
        maxThickness: z.number().optional(),
      })
      .partial()
      .optional(),
    pack: z
      .object({
        envelopeId: idRef($Envelope),
        printColour: z.enum(["BLACK", "COLOUR"]),
        paperColour: z.string().optional(),
        insert: idRef($Insert).optional(),
        features: z.array($SpecificationFeature).optional(),
        additional: z.record(z.string(), z.string()).optional(),
      })
      .partial()
      .optional(),
  })
  .describe("Specification");
export type Specification = z.infer<typeof $Specification>;
export const SpecificationId = $Specification.shape.id.parse;

export const $SpecificationGroup = ConfigBase("SpecificationGroup")
  .extend({
    name: z.string(),
    description: z.string().optional(),
    specificationType: $SpecificationType,
    status: $SpecificationStatus,
    clientId: z.string().optional(),
    campaignIds: z.array(z.string()).optional(),
    specificationIds: z.array(idRef($Specification)).nonempty(),
  })
  .describe("SpecificationGroup");
export type SpecificationGroup = z.infer<typeof $SpecificationGroup>;
export const SpecificaitonGroupId = $SpecificationGroup.shape.id.parse;
