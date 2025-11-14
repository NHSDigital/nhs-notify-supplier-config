import { randomUUID } from "node:crypto";
import { PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { packSpecificationEvents } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/pack-specification-events";
import { z } from "zod";
import { buildEventSource, configFromEnv } from "event-builder/src/config";
import {
  SeverityText,
  generateTraceParent,
  newSequenceGenerator,
  severityNumber,
} from "event-builder/src/lib/envelope-helpers";

export interface BuildPackSpecificationEventOptions {
  severity?: SeverityText;
  sequence?: string | Generator<string, never, undefined>;
}

export type PackSpecificationSpecialisedEvent = z.infer<
  (typeof packSpecificationEvents)[keyof typeof packSpecificationEvents]
>;

export const buildPackSpecificationEvent = (
  pack: PackSpecification,
  opts: BuildPackSpecificationEventOptions = {},
  config = configFromEnv(),
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
      `No specialised event schema found for status ${pack.status}`,
    );
  }
  const now = new Date().toISOString();
  const dataschemaversion = config.EVENT_DATASCHEMAVERSION;
  const dataschema = `https://notify.nhs.uk/cloudevents/schemas/supplier-config/pack-specification.${lcStatus}.${dataschemaversion}.schema.json`;
  const severity = opts.severity ?? "INFO";
  const baseEvent = {
    specversion: "1.0",
    id: randomUUID(),
    source: buildEventSource(config),
    subject: `supplier-config/pack-specification/${pack.id}`,
    type: specialised.shape.type.options[0],
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
    sequence:
      typeof opts.sequence === "object"
        ? opts.sequence.next().value
        : opts.sequence,
  };
  return specialised.parse(baseEvent);
};

export const buildPackSpecificationEvents = (
  packs: Record<string, PackSpecification>,
  startingCounter = 1,
): PackSpecificationSpecialisedEvent[] => {
  const sequenceGenerator = newSequenceGenerator(startingCounter);

  return Object.values(packs)
    .map((p) => {
      return buildPackSpecificationEvent(p, { sequence: sequenceGenerator });
    })
    .filter((e): e is PackSpecificationSpecialisedEvent => e !== undefined);
};
