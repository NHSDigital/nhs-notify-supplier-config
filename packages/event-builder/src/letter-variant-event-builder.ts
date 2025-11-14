import { randomUUID } from "node:crypto";
import { LetterVariant } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";
import { letterVariantEvents } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/letter-variant-events";
import { z } from "zod";
import { buildEventSource, configFromEnv } from "event-builder/src/config";
import {
  SeverityText,
  generateTraceParent,
  newSequenceGenerator,
  severityNumber,
} from "event-builder/src/lib/envelope-helpers";

export interface BuildLetterVariantEventOptions {
  severity?: SeverityText;
  sequence?: string | Generator<string, never, undefined>;
}

export type LetterVariantSpecialisedEvent = z.infer<
  (typeof letterVariantEvents)[keyof typeof letterVariantEvents]
>;

export const buildLetterVariantEvent = (
  variant: LetterVariant,
  opts: BuildLetterVariantEventOptions = {},
  config = configFromEnv(),
): LetterVariantSpecialisedEvent | undefined => {
  if (variant.status === "DRAFT") return undefined; // skip drafts

  const lcStatus = variant.status.toLowerCase();
  const schemaKey =
    `letter-variant.${lcStatus}` as keyof typeof letterVariantEvents;
  // Access using controlled key constructed from validated status
  // eslint-disable-next-line security/detect-object-injection
  const specialised = letterVariantEvents[schemaKey];
  if (!specialised) {
    throw new Error(
      `No specialised event schema found for status ${variant.status}`,
    );
  }
  const now = new Date().toISOString();
  const dataschemaversion = config.EVENT_DATASCHEMAVERSION;
  const dataschema = `https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.${lcStatus}.${dataschemaversion}.schema.json`;
  const severity = opts.severity ?? "INFO";
  return specialised.parse({
    specversion: "1.0",
    id: randomUUID(),
    source: buildEventSource(config),
    subject: `supplier-config/letter-variant/${variant.id}`,
    type: specialised.shape.type.options[0],
    time: now,
    datacontenttype: "application/json",
    dataschema,
    data: { ...variant, status: variant.status },
    traceparent: generateTraceParent(),
    recordedtime: now,
    severitytext: severity,
    severitynumber: severityNumber(severity),
    partitionkey: variant.id,
    sequence:
      typeof opts.sequence === "object"
        ? opts.sequence.next().value
        : opts.sequence,
  });
};

export const buildLetterVariantEvents = (
  variants: Record<string, LetterVariant>,
  startingCounter = 1,
): LetterVariantSpecialisedEvent[] => {
  const sequenceGenerator = newSequenceGenerator(startingCounter);

  return (
    Object.values(variants)
      .map((v) => buildLetterVariantEvent(v, { sequence: sequenceGenerator }))
      // key fields are UUIDs already validated so dynamic filtering is safe
      .filter((e): e is LetterVariantSpecialisedEvent => e !== undefined)
  );
};
