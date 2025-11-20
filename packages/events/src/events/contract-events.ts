import { z } from "zod";
import { $Contract, Contract } from "../domain";
import { EventEnvelope } from "./event-envelope";

const statuses = [
  "PUBLISHED",
  "DISABLED",
] as const satisfies readonly Contract["status"][];

/**
 * Generic schema for parsing any Contract status change event
 */
export const $ContractEvent = EventEnvelope(
  "contract",
  "contract",
  $Contract,
  statuses,
).meta({
  title: "contract.* Event",
  description: "Generic event schema for contract changes",
});

/**
 * Specialise the generic event schema for a single status
 * @param status
 */
function specialiseContractEvent(status: (typeof statuses)[number]) {
  const lcStatus = status.toLowerCase();
  return EventEnvelope(
    `contract.${lcStatus}`,
    "contract",
    $Contract
      .extend({
        status: z.literal(status),
      })
      .meta({
        title: "Contract",
        description: `An individual contract under which suppliers will be allocated capacity.

For this event the status is always \`${status}\``,
      }),
    [status],
  ).meta({
    title: `contract.${lcStatus} Event`,
    description: `Event schema for contract change to ${status}`,
  });
}

export const contractEvents = {
  "contract.published": specialiseContractEvent("PUBLISHED"),
  "contract.disabled": specialiseContractEvent("DISABLED"),
} as const;
