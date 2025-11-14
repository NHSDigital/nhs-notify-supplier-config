import {
  Contract,
  ContractId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config";
import {
  buildContractEvent,
  buildContractEvents,
} from "../contract-event-builder";
import { configFromEnv } from "../config";

describe("contract-event-builder", () => {
  const baseContract: Contract = {
    id: ContractId("contract-1"),
    name: "Contract 1",
    startDate: "2025-01-01", // date only per schema
    status: "PUBLISHED",
  };
  const secondContract: Contract = {
    id: ContractId("contract-2"),
    name: "Contract 2",
    startDate: "2025-01-02", // date only
    status: "PUBLISHED",
  };
  const draftContract: Contract = {
    id: ContractId("contract-draft"),
    name: "Contract Draft",
    startDate: "2025-01-03", // date only
    status: "DRAFT",
  };
  const disabledContract: Contract = {
    id: ContractId("contract-disabled"),
    name: "Contract Disabled",
    startDate: "2025-02-01",
    status: "DISABLED",
  };

  it("builds event with explicit sequence string and severity ERROR", () => {
    const cfg = configFromEnv();
    const event = buildContractEvent(
      baseContract,
      {
        severity: "ERROR",
        sequence: "00000000000000000042",
      },
      cfg,
    );
    expect(event).toBeDefined();
    expect(event!.sequence).toBe("00000000000000000042");
    expect(event!.severitytext).toBe("ERROR");
    expect(event!.severitynumber).toBe(4);
    expect(event!.subject).toBe("contract/contract-1");
    expect(event!.type).toBe(
      "uk.nhs.notify.supplier-config.contract.published.v1",
    );
  });

  it("builds events using generator sequence path (object branch)", () => {
    const events = buildContractEvents(
      { c1: baseContract, c2: secondContract },
      10,
    );
    expect(events).toHaveLength(2);
    expect(events[0]!.sequence).toBe("00000000000000000010");
    expect(events[1]!.sequence).toBe("00000000000000000011");
    // default severity INFO
    expect(events[0]!.severitytext).toBe("INFO");
    expect(events[0]!.severitynumber).toBe(2);
  });

  it("builds events using generator sequence and default startingCounter", () => {
    const events = buildContractEvents({
      c1: baseContract,
      c2: secondContract,
    });
    expect(events).toHaveLength(2);
    expect(events[0]!.sequence).toBe("00000000000000000001");
    expect(events[1]!.sequence).toBe("00000000000000000002");
    // default severity INFO
    expect(events[0]!.severitytext).toBe("INFO");
    expect(events[0]!.severitynumber).toBe(2);
  });

  it("builds event without sequence (undefined branch) and severity WARN", () => {
    const event = buildContractEvent(baseContract, { severity: "WARN" });
    expect(event).toBeDefined();
    expect(event!.sequence).toBeUndefined();
    expect(event!.severitytext).toBe("WARN");
    expect(event!.severitynumber).toBe(3);
  });

  it("applies severity FATAL mapping", () => {
    const event = buildContractEvent(baseContract, { severity: "FATAL" });
    expect(event).toBeDefined();
    expect(event!.severitytext).toBe("FATAL");
    expect(event!.severitynumber).toBe(5);
  });

  it("returns undefined for DRAFT contract", () => {
    const event = buildContractEvent(draftContract);
    expect(event).toBeUndefined();
  });

  it("buildContractEvents includes undefined for DRAFT contract", () => {
    const events = buildContractEvents({
      published: baseContract,
      draft: draftContract,
    });
    expect(events).toHaveLength(2);
    const publishedEvent = events.find(
      (e) => e && e.subject === "contract/contract-1",
    );
    expect(publishedEvent).toBeDefined();
    const draftEvent = events.find(
      (e) => e?.subject === "contract/contract-draft",
    );
    expect(draftEvent).toBeUndefined();
    expect(events.filter((e) => e === undefined)).toHaveLength(1);
  });

  it("builds event for DISABLED status", () => {
    const event = buildContractEvent(disabledContract);
    expect(event).toBeDefined();
    expect(event!.type).toBe("uk.nhs.notify.supplier-config.contract.disabled.v1");
    expect(event!.subject).toBe("contract/contract-disabled");
    expect(event!.partitionkey).toBe(disabledContract.id);
  });

  it("builds event with TRACE severity", () => {
    const event = buildContractEvent(baseContract, { severity: "TRACE" });
    expect(event).toBeDefined();
    expect(event!.severitytext).toBe("TRACE");
    expect(event!.severitynumber).toBe(0);
  });

  it("builds event with DEBUG severity", () => {
    const event = buildContractEvent(baseContract, { severity: "DEBUG" });
    expect(event).toBeDefined();
    expect(event!.severitytext).toBe("DEBUG");
    expect(event!.severitynumber).toBe(1);
  });

  it("includes partitionkey and valid traceparent format", () => {
    const event = buildContractEvent(baseContract);
    expect(event).toBeDefined();
    expect(event!.partitionkey).toBe(baseContract.id);
    expect(event!.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });

  it("uses custom config env overrides for source and dataschema version", () => {
    const originalEnv = { ...process.env };
    try {
      process.env.EVENT_ENV = "staging";
      process.env.EVENT_SERVICE = "custom-service";
      process.env.EVENT_DATASCHEMAVERSION = "1.9.9"; // must start with major '1.' per schema regex
      const cfg = configFromEnv();
      const event = buildContractEvent(baseContract, {}, cfg);
      expect(event).toBeDefined();
      expect(event!.source).toBe("/control-plane/supplier-config/staging/custom-service");
      expect(event!.dataschema).toMatch(/contract\.published\.1\.9\.9\.schema\.json$/);
    } finally {
      process.env = originalEnv; // restore
    }
  });

  it("throws error when specialised schema missing (unknown status)", () => {
    // Force an invalid status not in contractEvents map
    const bogus = { ...baseContract, status: "ARCHIVED" as any };
    expect(() => buildContractEvent(bogus as Contract)).toThrow(
      /No specialised event schema found for status ARCHIVED/,
    );
  });
});
