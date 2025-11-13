import { z } from "zod/index";
import { $EnvelopeProfile } from "./envelope-profile";

// eslint-disable-next-line import-x/prefer-default-export
export function SupplierConfigEnvelope<TData extends z.ZodTypeAny>(
  eventName: string,
  resourceName: string,
  data: TData,
  statuses: readonly string[],
) {
  const statusRegex = statuses.map((s) => s.toLowerCase()).join("|");
  return $EnvelopeProfile.extend({
    type: z
      .enum(
        statuses.map(
          (status) =>
            `uk.nhs.notify.supplier-config.${resourceName}.${status.toLowerCase()}.v1`,
        ),
      )
      .meta({
        title: `${eventName} event type`,
        description: "Event type using reverse-DNS style",
        examples: statuses.map(
          (status) =>
            `uk.nhs.notify.supplier-config.${resourceName}.${status.toLowerCase()}.v1`,
        ),
      }),

    dataschema: z
      .string()
      .regex(
        new RegExp(
          `^https://notify\\.nhs\\.uk/cloudevents/schemas/supplier-config/${resourceName}\\.(?<status>${statusRegex})\\.1\\.\\d+\\.\\d+\\.schema.json$`,
        ),
      )
      .meta({
        title: "Data Schema URI",
        description: `URI of a schema that describes the event data\n\nData schema version must match the major version indicated by the type`,
        examples: statuses.map(
          (status) =>
            `https://notify.nhs.uk/cloudevents/schemas/supplier-config/${resourceName}.${status.toLowerCase()}.1.0.0.schema.json`,
        ),
      }),

    dataschemaversion: z
      .string()
      .regex(/^1\.\d+\.\d+$/)
      .meta({
        title: "Data Schema Version",
        description:
          "Matches semantic versioning format with fixed major version (Not part of cloudevents spec?)",
      }),

    subject: z
      .string()
      .regex(new RegExp(`/supplier-config/${resourceName}/[a-z0-9-]+$`))
      .meta({
        title: "Event Subject",
        description:
          "Resource path (no leading slash) within the source made of segments separated by '/'.",
        examples: [
          "supplier-config/pack-specification/f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ],
      }),

    source: z
      .string()
      .regex(/^\/control-plane\/supplier-config(?:\/.*)?$/)
      .meta({
        title: "Event Source",
        description:
          "Logical event producer path within the supplier-config domain",
      }),

    data: data,
  });
}
