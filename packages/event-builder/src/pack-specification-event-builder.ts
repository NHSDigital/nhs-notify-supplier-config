import { randomUUID } from "node:crypto";
import { PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { packSpecificationEvents } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/pack-specification-events";
import { z } from "zod";
import { buildEventSource } from "event-builder/src/config";
import {
  SeverityText,
  generateTraceParent,
  nextSequence,
  severityNumber,
} from "event-builder/src/lib/envelope-helpers";

export interface BuildPackSpecificationEventOptions {
  severity?: SeverityText;
  sequence?: string; // optional override
}

export type PackSpecificationSpecialisedEvent = z.infer<
  (typeof packSpecificationEvents)[keyof typeof packSpecificationEvents]
>;

export const buildPackSpecificationEvent = (
  pack: PackSpecification,
  opts: BuildPackSpecificationEventOptions & { sequenceCounter?: number } = {},
): PackSpecificationSpecialisedEvent | undefined => {
  if (pack.status === "DRAFT") return undefined; // skip drafts
  const lcStatus = pack.status.toLowerCase();
  const schemaKey =
    `pack-specification.${lcStatus}` as keyof typeof packSpecificationEvents;
  // Access using controlled key constructed from validated status
  // eslint-disable-next-line security/detect-object-injection
  const specialised = packSpecificationEvents[schemaKey];
  if (!specialised) {
    throw new Error(
      `No specialised pack-specification event schema found for status ${pack.status}`,
    );
  }
  const now = new Date().toISOString();
  const dataschemaversion = "1.0.0"; // fixed version per examples
  const dataschema = `https://notify.nhs.uk/cloudevents/schemas/supplier-config/pack-specification.${lcStatus}.1.0.0.schema.json`;
  const severity = opts.severity ?? "INFO";
  const baseEvent = {
    specversion: "1.0",
    id: randomUUID(),
    source: buildEventSource(),
    subject: `supplier-config/pack-specification/${pack.id}`,
    type: specialised.shape.type.value,
    time: now,
    datacontenttype: "application/json",
    dataschema,
    dataschemaversion,
    data: { ...pack, status: pack.status },
    traceparent: generateTraceParent(),
    recordedtime: now,
    severitytext: severity,
    severitynumber: severityNumber(severity),
    partitionkey: pack.id,
    sequence: opts.sequence ?? nextSequence(opts.sequenceCounter ?? 1),
  } as unknown; // cast to unknown before schema validation
  return specialised.parse(baseEvent);
};

export const buildPackSpecificationEvents = (
  packs: Record<string, PackSpecification>,
  startingCounter = 1,
): PackSpecificationSpecialisedEvent[] => {
  let counter = startingCounter;
  return Object.values(packs)
    .map((p) => {
      const ev = buildPackSpecificationEvent(p, { sequenceCounter: counter });
      counter += 1;
      return ev;
    })
    .filter((e): e is PackSpecificationSpecialisedEvent => e !== undefined);
};
