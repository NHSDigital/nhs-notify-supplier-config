import {
  ContractId,
  LetterVariant,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src";
import {
  buildLetterVariantEvent,
  buildLetterVariantEvents,
} from "../letter-variant-event-builder";
import { configFromEnv } from "../config";

describe("letter-variant-event-builder", () => {
  const base: Partial<LetterVariant> = {
    name: "Test Variant",
    description: "Test",
    contractId: ContractId("contract-123"),
    type: "STANDARD",
    packSpecificationIds: ["00000000-0000-0000-0000-000000000001" as any],
    clientId: "client-1",
  };

  it("skips draft", () => {
    const ev = buildLetterVariantEvent({
      ...base,
      id: "11111111-1111-1111-1111-111111111111" as any,
      status: "DRAFT",
    } as LetterVariant);
    expect(ev).toBeUndefined();
  });

  it("throws on unknown status", () => {
    const variant = {
      ...base,
      id: "11111111-1111-1111-1111-111111111111" as any,
      status: "UNKNOWN" as any,
    } as unknown as LetterVariant;
    expect(() => buildLetterVariantEvent(variant)).toThrow(
      /No specialised event schema found for status UNKNOWN/,
    );
  });

  it("builds published", () => {
    const ev = buildLetterVariantEvent({
      ...base,
      id: "22222222-2222-2222-2222-222222222222" as any,
      status: "PUBLISHED",
    } as LetterVariant);
    expect(ev).toBeDefined();
    expect(ev!.type).toMatch(/letter-variant.published/);
    expect(ev!.subject).toBe(
      "letter-variant/22222222-2222-2222-2222-222222222222",
    );
    expect(ev!.partitionkey).toBe("22222222-2222-2222-2222-222222222222");
    expect(ev!.severitytext).toBe("INFO");
  });

  it("builds multiple with sequence ordering", () => {
    const events = buildLetterVariantEvents({
      a: {
        ...base,
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as any,
        status: "PUBLISHED",
      } as LetterVariant,
      b: {
        ...base,
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as any,
        status: "DISABLED",
      } as LetterVariant,
    });
    expect(events).toHaveLength(2);
    expect(events[0].sequence).toBe("00000000000000000001");
    expect(events[1].sequence).toBe("00000000000000000002");
  });

  it("applies configured dataschema version", () => {
    const config = { ...configFromEnv(), EVENT_DATASCHEMAVERSION: "1.999.0" };
    const ev = buildLetterVariantEvent(
      {
        ...base,
        id: "22222222-2222-2222-2222-222222222222" as any,
        status: "PUBLISHED",
      } as LetterVariant,
      {},
      config,
    );
    expect(ev).toBeDefined();
    expect(ev?.dataschema).toMatch(
      /letter-variant\.published\.1\.999\.0\.schema\.json$/,
    );
  });
});
