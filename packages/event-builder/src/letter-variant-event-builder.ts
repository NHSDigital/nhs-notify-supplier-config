import { randomUUID } from "node:crypto";
import { LetterVariant } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";
import { letterVariantEvents } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/letter-variant-events";
import { z } from "zod";
import { buildEventSource } from "event-builder/src/config";
import {
  SeverityText,
  generateTraceParent,
  nextSequence,
  severityNumber,
} from "event-builder/src/lib/envelope-helpers";

export interface BuildLetterVariantEventOptions {
  severity?: SeverityText;
  sequence?: string; // optional override
}

export type LetterVariantSpecialisedEvent = z.infer<
  (typeof letterVariantEvents)[keyof typeof letterVariantEvents]
>;

export const buildLetterVariantEvent = (
  variant: LetterVariant,
  opts: BuildLetterVariantEventOptions & { sequenceCounter?: number } = {},
): LetterVariantSpecialisedEvent | undefined => {
  if (variant.status === "DRAFT") return undefined; // skip drafts

  const lcStatus = variant.status.toLowerCase();
  const schemaKey =
    `letter-variant.${lcStatus}` as keyof typeof letterVariantEvents;
  const specialised = letterVariantEvents[schemaKey];
  if (!specialised) {
    throw new Error(
      `No specialised event schema found for status ${variant.status}`,
    );
  }
  const now = new Date().toISOString();
  const dataschemaversion = "1.0.0"; // fixed version per examples
  const dataschema = `https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.${lcStatus}.1.0.0.schema.json`;
  const severity = opts.severity ?? "INFO";
  const baseEvent = {
    specversion: "1.0",
    id: randomUUID(),
    source: buildEventSource(),
    subject: `supplier-config/letter-variant/${variant.id}`,
    type: specialised.shape.type.value,
    time: now,
    datacontenttype: "application/json",
    dataschema,
    dataschemaversion,
    data: { ...variant, status: variant.status },
    traceparent: generateTraceParent(),
    recordedtime: now,
    severitytext: severity,
    severitynumber: severityNumber(severity),
    partitionkey: variant.id,
    sequence: opts.sequence ?? nextSequence(opts.sequenceCounter ?? 1),
  } as unknown; // cast to unknown before schema validation

  const parsed = specialised.parse(baseEvent);
  return parsed;
};

export const buildLetterVariantEvents = (
  variants: Record<string, LetterVariant>,
): LetterVariantSpecialisedEvent[] => {
  let counter = 1;
  return (
    Object.values(variants)
      .map((v) => {
        const ev = buildLetterVariantEvent(v, { sequenceCounter: counter });
        counter += 1; // avoid ++ per lint rule
        return ev;
      })
      // key fields are UUIDs already validated so dynamic filtering is safe
      .filter((e): e is LetterVariantSpecialisedEvent => e !== undefined)
  );
};
