import { z } from "zod";
import {
  $Version,
  ConfigBase,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";
import { idRef } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/helpers/id-ref";

export const $PackFeature = z.enum(["MAILMARK", "BRAILLE", "AUDIO", "ADMAIL"]);
export const $EnvelopeFeature = z.enum([
  "WHITEMAIL",
  "NHS_BRANDING",
  "NHS_BARCODE",
]);

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

export const $PackSpecification = ConfigBase("PackSpecification")
  .extend({
    name: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED", "DISABLED"]),
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
    assembly: z
      .object({
        envelopeId: idRef($Envelope),
        printColour: z.enum(["BLACK", "COLOUR"]),
        paperColour: z.string().optional(),
        insert: idRef($Insert).optional(),
        features: z.array($PackFeature).optional(),
        additional: z.record(z.string(), z.string()).optional(),
      })
      .partial()
      .optional(),
  })
  .describe("PackSpecification");
export type PackSpecification = z.infer<typeof $PackSpecification>;
export const PackSpecificationId = $PackSpecification.shape.id.parse;
