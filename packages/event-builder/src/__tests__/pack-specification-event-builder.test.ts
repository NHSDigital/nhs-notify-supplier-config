import { PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import {
  buildPackSpecificationEvent,
  buildPackSpecificationEvents,
} from "../pack-specification-event-builder";

describe("pack-specification-event-builder", () => {
  const base: Partial<PackSpecification> = {
    name: "Test Pack",
    status: "PUBLISHED",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    version: 1,
    postage: { tariff: "ECONOMY", size: "STANDARD" },
  };

  it("skips draft", () => {
    const ev = buildPackSpecificationEvent({
      ...base,
      id: "11111111-1111-1111-1111-111111111111" as any,
      status: "DRAFT",
    } as PackSpecification);
    expect(ev).toBeUndefined();
  });

  it("builds published", () => {
    const ev = buildPackSpecificationEvent({
      ...base,
      id: "22222222-2222-2222-2222-222222222222" as any,
      status: "PUBLISHED",
    } as PackSpecification);
    expect(ev).toBeDefined();
    expect(ev!.type).toMatch(/pack-specification.published/);
    expect(ev!.subject).toBe(
      "supplier-config/pack-specification/22222222-2222-2222-2222-222222222222",
    );
    expect(ev!.partitionkey).toBe("22222222-2222-2222-2222-222222222222");
    expect(ev!.severitytext).toBe("INFO");
  });

  it("builds multiple with sequence ordering", () => {
    const events = buildPackSpecificationEvents({
      a: {
        ...base,
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as any,
        status: "PUBLISHED",
      } as PackSpecification,
      b: {
        ...base,
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as any,
        status: "DISABLED",
      } as PackSpecification,
    });
    expect(events).toHaveLength(2);
    expect(events[0].sequence).toBe("00000000000000000001");
    expect(events[1].sequence).toBe("00000000000000000002");
  });
});
