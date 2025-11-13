import { z } from "zod/index";
import { $EnvelopeProfile } from "./envelope-profile";
import { $SupplierAllocation } from "../domain";

const allocationStatuses = $SupplierAllocation.shape.status.options;
const allocationStatusRegex = allocationStatuses
  .map((s) => s.toLowerCase())
  .join("|");

/**
 * Generic schema for parsing any SupplierAllocation status change event
 */
export const $SupplierAllocationEvent = $EnvelopeProfile
  .safeExtend({
    type: z
      .enum(
        allocationStatuses.map(
          (status) =>
            `uk.nhs.notify.supplier-config.supplier-allocation.${status.toLowerCase()}.v1`,
        ),
      )
      .meta({
        title: "SupplierAllocation event type",
        description: "Event type using reverse-DNS style",
        examples: [
          "uk.nhs.notify.supplier-config.supplier-allocation.published.v1",
          "uk.nhs.notify.supplier-config.supplier-allocation.disabled.v1",
        ],
      }),
    dataschema: z
      .string()
      .regex(
        new RegExp(
          `^https://notify\\.nhs\\.uk/cloudevents/schemas/supplier-config/supplier-allocation\\.(?<status>${allocationStatusRegex})\\.1\\.\\d+\\.\\d+\\.schema.json$`,
        ),
      )
      .meta({
        title: "Data Schema URI",
        description: `URI of a schema that describes the event data\n\nData schema version must match the major version indicated by the type`,
        examples: [
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/supplier-allocation.published.1.0.0.schema.json",
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/supplier-allocation.removed.1.0.0.schema.json",
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
      .regex(/^supplier-config\/supplier-allocation\/[a-z0-9-]+/)
      .meta({
        title: "Event Subject",
        description:
          "Resource path (no leading slash) within the source made of segments separated by '/'.",
        examples: [
          "supplier-config/supplier-allocation/f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ],
      }),
    data: $SupplierAllocation.meta({
      title: "SupplierAllocation",
      description:
        "A SupplierAllocation defines the composition, postage and assembly attributes for producing a pack.",
    }),
  })
  .meta({
    title: "supplier-allocation.* Event",
    description: "Base event schema for supplier allocation changes",
  });
