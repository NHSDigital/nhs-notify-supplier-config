import { z } from "zod";
import { $EnvelopeProfile } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/envelope-profile";
import { $PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";

// PackSpecification statuses (excluding DRAFT for event emission)
const packStatuses = ["PUBLISHED", "DISABLED"] as const;
const packStatusRegex = packStatuses.map((s) => s.toLowerCase()).join("|");

/**
 * Generic schema for parsing any PackSpecification status change event
 */
export const $PackSpecificationEvent = $EnvelopeProfile
  .safeExtend({
    type: z
      .enum(
        packStatuses.map(
          (status) =>
            `uk.nhs.notify.supplier-config.pack-specification.${status.toLowerCase()}.v1`,
        ),
      )
      .meta({
        title: "PackSpecification event type",
        description: "Event type using reverse-DNS style",
        examples: [
          "uk.nhs.notify.supplier-config.pack-specification.published.v1",
          "uk.nhs.notify.supplier-config.pack-specification.disabled.v1",
        ],
      }),
    dataschema: z
      .string()
      .regex(
        new RegExp(
          `^https://notify\\.nhs\\.uk/cloudevents/schemas/supplier-config/pack-specification\\.(?<status>${packStatusRegex})\\.1\\.\\d+\\.\\d+\\.schema.json$`,
        ),
      )
      .meta({
        title: "Data Schema URI",
        description: `URI of a schema that describes the event data\n\nData schema version must match the major version indicated by the type`,
        examples: [
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/pack-specification.published.1.0.0.schema.json",
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/pack-specification.disabled.1.0.0.schema.json",
        ],
      }),
    dataschemaversion: z
      .string()
      .regex(/^1\.\d+\.\d+$/)
      .meta({
        title: "Data Schema Version",
        description:
          "Matches semantic versioning format with fixed major version (Not part of cloudevents spec?)",
      }),
    source: z
      .string()
      // Fixed pattern mirrors existing letter variant events; disable lint as in other files
      // eslint-disable-next-line security/detect-unsafe-regex
      .regex(/^\/control-plane\/supplier-config(?:\/.*)?$/)
      .meta({
        title: "Event Source",
        description:
          "Logical event producer path within the supplier-config domain",
      }),
    subject: z
      .string()
      .regex(/^supplier-config\/pack-specification\/[a-z0-9-]+/)
      .meta({
        title: "Event Subject",
        description:
          "Resource path (no leading slash) within the source made of segments separated by '/'.",
        examples: [
          "supplier-config/pack-specification/f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ],
      }),
    data: $PackSpecification.meta({
      title: "PackSpecification",
      description:
        "A PackSpecification defines the composition, postage and assembly attributes for producing a pack.",
    }),
  })
  .meta({
    title: "pack-specification.* Event",
    description: "Base event schema for pack specification changes",
  });

const specialisePackSpecificationEvent = (
  status: (typeof packStatuses)[number],
) => {
  const lcStatus = status.toLowerCase();
  const eventType = `uk.nhs.notify.supplier-config.pack-specification.${lcStatus}.v1`;
  return $PackSpecificationEvent
    .safeExtend({
      type: z.literal(eventType).meta({
        title: `PackSpecification ${status} event type`,
        description: "Event type using reverse-DNS style",
        examples: [eventType],
      }),
      dataschema: z
        .string()
        .regex(
          status === "PUBLISHED"
            ? /^https:\/\/notify\.nhs\.uk\/cloudevents\/schemas\/supplier-config\/pack-specification\.published\.1\.\d+\.\d+\.schema.json$/
            : /^https:\/\/notify\.nhs\.uk\/cloudevents\/schemas\/supplier-config\/pack-specification\.disabled\.1\.\d+\.\d+\.schema.json$/,
        )
        .meta({
          title: "Data Schema URI",
          description: `URI of a schema that describes the event data\n\nData schema version must match the major version indicated by the type`,
          examples: [
            `https://notify.nhs.uk/cloudevents/schemas/supplier-config/pack-specification.${lcStatus}.1.0.0.schema.json`,
          ],
        }),
      data: $PackSpecification
        .extend({
          status: z.literal(status),
        })
        .meta({
          title: "PackSpecification",
          description: `A PackSpecification defines the composition, postage and assembly attributes for producing a pack.\n\nFor this event the status is always \`${status}\``,
        }),
    })
    .meta({
      title: `pack-specification.${lcStatus} Event`,
      description: `Event schema for pack specification change to ${status}`,
    });
};

export const packSpecificationEvents = Object.fromEntries(
  packStatuses.map((status) => [
    `pack-specification.${status.toLowerCase()}`,
    specialisePackSpecificationEvent(status),
  ]),
);
