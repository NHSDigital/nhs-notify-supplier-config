import { z } from "zod";
import { $SupplierAllocation, SupplierAllocation } from "../domain";
import { EventEnvelope } from "./event-envelope";

const allocationStatuses = [
  "PUBLISHED",
  "REMOVED",
] as const satisfies readonly SupplierAllocation["status"][];

/**
 * Generic schema for parsing any SupplierAllocation status change event
 */
export const $SupplierAllocationEvent = EventEnvelope(
  "supplier-allocation",
  "supplier-allocation",
  $SupplierAllocation,
  allocationStatuses,
).meta({
  title: "supplier-allocation.* Event",
  description: "Generic event schema for supplier allocation changes",
});

/**
 * Specialise the generic event schema for a single status
 * @param status
 */
function specialiseSupplierAllocationEvent(
  status: (typeof allocationStatuses)[number],
) {
  const lcStatus = status.toLowerCase();
  return EventEnvelope(
    `supplier-allocation.${lcStatus}`,
    "supplier-allocation",
    $SupplierAllocation
      .extend({
        status: z.literal(status),
      })
      .meta({
        description: `Indicates whether this supplier allocation is currently active or has been removed.

For this event the status is always \`${status}\``,
      }),
    [status],
  ).meta({
    title: `supplier-allocation.${lcStatus} Event`,
    description: `Event schema for supplier allocation change to ${status}`,
  });
}

export const supplierAllocationEvents = {
  "supplier-allocation.published":
    specialiseSupplierAllocationEvent("PUBLISHED"),
  "supplier-allocation.removed": specialiseSupplierAllocationEvent("REMOVED"),
} as const;
