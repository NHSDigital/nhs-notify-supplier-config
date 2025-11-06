import { z } from "zod";
import { $EnvelopeProfile } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/envelope-profile";
import {
  $LetterVariant,
  $LetterVariantStatus,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";

const variantStatuses = $LetterVariantStatus.options.filter(
  (status) => status !== "DRAFT",
);

const variantStatusRegex = variantStatuses
  .map((status) => status.toLowerCase())
  .join("|");

/**
 * A generic schema for parsing any letter status change event
 */
export const $LetterVariantEvent = $EnvelopeProfile
  .safeExtend({
    type: z
      .enum(
        variantStatuses.map(
          (status) =>
            `uk.nhs.notify.supplier-config.letter-variant.${status.toLowerCase()}.v1`,
        ),
      )
      .meta({
        title: `Letter event type`,
        description: "Event type using reverse-DNS style",
        examples: [
          "uk.nhs.notify.supplier-config.letter-variant.published.v1",
          "uk.nhs.notify.supplier-config.letter-variant.disabled.v1",
        ],
      }),

    dataschema: z
      .string()
      .regex(
        new RegExp(
          `^https:\\/\\/notify\\.nhs\\.uk\\/cloudevents\\/schemas\\/supplier-config\\/letter-variant\\.(?<status>${variantStatusRegex})\\.1\\.\\d+\\.\\d+\\.schema.json$`,
        ),
      )
      .meta({
        title: "Data Schema URI",
        description: `URI of a schema that describes the event data

Data schema version must match the major version indicated by the type`,
        examples: [
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config.letter-variant.published.1.0.0.schema.json",
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config.letter-variant.disabled.1.0.0.schema.json",
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
      .regex(/^\/control-plane\/supplier-config(?:\/.*)?$/)
      .meta({
        title: "Event Source",
        description:
          "Logical event producer path within the supplier-config domain",
      }),

    subject: z
      .string()
      .regex(/^supplier-config\/letter-variant\/[a-z0-9-]+/)
      .meta({
        title: "Event Subject",
        description:
          "Resource path (no leading slash) within the source made of segments separated by '/'.",
        examples: [
          "supplier-config/letter-variant/f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ],
      }),

    // This replaces the data definition from EnvelopeProfile rather than extending it
    data: $LetterVariant.meta({
      title: "Letter Variant",
      description: `A Letter Variant describes a letter that can be produced with particular characteristics, and may be scoped to a single clientId and campaignId.`,
    }),
  })
  .meta({
    title: `letter-variant.* Event`,
    description: `Base event schema for letter variant changes`,
  });
export type LetterVariantEvent = z.infer<typeof $LetterVariantEvent>;

/**
 * Specialise the generic event schema for a single status
 * @param status
 */
const specialiseLetterVariantEvent = (status: (typeof variantStatuses)[0]) => {
  const lcStatus = status.toLowerCase();
  const eventType = `uk.nhs.notify.supplier-config.letter-variant.${lcStatus}.v1`;

  return $LetterVariantEvent
    .safeExtend({
      type: z.literal(eventType).meta({
        title: `LetterVariant ${status} event type`,
        description: "Event type using reverse-DNS style",
        examples: [eventType],
      }),

      dataschema: z
        .string()
        .regex(
          new RegExp(
            `^https:\\/\\/notify\\.nhs\\.uk\\/cloudevents\\/schemas\\/supplier-config\\/letter-variant.${lcStatus}.1\\.\\d+\\.\\d+\\.schema.json$`,
          ),
        )
        .meta({
          title: "Data Schema URI",
          description: `URI of a schema that describes the event data

Data schema version must match the major version indicated by the type`,
          examples: [
            `https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.${lcStatus}.1.0.0.schema.json`,
          ],
        }),

      data: $LetterVariant
        .extend({
          status: z.literal(status),
        })
        .meta({
          title: "Letter Variant",
          description: `A Letter Variant describes a letter that can be produced with particular characteristics, and may be scoped to a single clientId and campaignId.

For this event the status is always \`${status}\``,
        }),
    })
    .meta({
      title: `letter-variant.${lcStatus} Event`,
      description: `Event schema for letter variant change to ${status}`,
    });
};

export const letterVariantEvents = Object.fromEntries(
  variantStatuses.map((status) => [
    `letter-variant.${status.toLowerCase()}`,
    specialiseLetterVariantEvent(status),
  ]),
);
