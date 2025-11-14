import { Contract } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/contract";
import { configFromEnv } from "event-builder/src/config";
import {
  SeverityText,
  newSequenceGenerator,
} from "event-builder/src/lib/envelope-helpers";
import { buildBaseEventEnvelope } from "event-builder/src/lib/base-event-envelope";
import { z } from "zod";
import {
  $ContractEvent,
  contractEvents,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config";

export interface BuildContractEventOptions {
  severity?: SeverityText;
  sequence?: string | Generator<string, never, undefined>;
}

type ContractEvent = z.infer<typeof $ContractEvent>;

export const buildContractEvent = (
  contract: Contract,
  opts: BuildContractEventOptions = {},
  config = configFromEnv(),
): ContractEvent | undefined => {
  if (contract.status === "DRAFT") return undefined; // skip drafts

  const lcStatus = contract.status.toLowerCase();
  const schemaKey = `contract.${lcStatus}` as keyof typeof contractEvents;
  // Access using controlled key constructed from validated status
  // eslint-disable-next-line security/detect-object-injection
  const specialised = contractEvents[schemaKey];
  if (!specialised) {
    throw new Error(
      `No specialised event schema found for status ${contract.status}`,
    );
  }
  const dataschemaversion = config.EVENT_DATASCHEMAVERSION;
  const dataschema = `https://notify.nhs.uk/cloudevents/schemas/supplier-config/contract.${lcStatus}.${dataschemaversion}.schema.json`;
  const severity = opts.severity ?? "INFO";
  return specialised.parse(
    buildBaseEventEnvelope(
      specialised.shape.type.options[0],
      `contract/${contract.id}`,
      contract.id,
      { ...contract, status: contract.status },
      dataschema,
      config,
      { severity, sequence: opts.sequence },
    ),
  );
};

export const buildContractEvents = (
  contracts: Record<string, Contract>,
  startingCounter = 1,
): (ContractEvent | undefined)[] => {
  const sequenceGenerator = newSequenceGenerator(startingCounter);

  return Object.values(contracts).map((c) =>
    buildContractEvent(c, { sequence: sequenceGenerator }),
  );
};
