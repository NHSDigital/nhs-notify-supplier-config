import {
  $SupplierEvent,
  supplierEvents,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/supplier-events";
import { SupplierId } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/supplier";

describe("Supplier Events", () => {
  describe("supplier.published event", () => {
    const validPublishedEvent = {
      specversion: "1.0",
      id: "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111",
      source: "/control-plane/supplier-config",
      subject: "supplier/test-supplier",
      type: "uk.nhs.notify.supplier-config.supplier.published.v1",
      time: "2025-10-01T10:15:30.000Z",
      recordedtime: "2025-10-01T10:15:30.250Z",
      severitynumber: 2,
      severitytext: "INFO",
      datacontenttype: "application/json",
      dataschema:
        "https://notify.nhs.uk/cloudevents/schemas/supplier-config/supplier.published.1.0.0.schema.json",
      traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
      data: {
        id: SupplierId("test-supplier"),
        name: "Test Supplier",
        channelType: "LETTER",
        dailyCapacity: 10_000,
        status: "PUBLISHED",
      },
    };

    it("validates a supplier.published event with generic schema", () => {
      const result = $SupplierEvent.safeParse(validPublishedEvent);
      expect(result.success).toBe(true);
    });

    it("validates with specialised published schema", () => {
      const publishedSchema = supplierEvents["supplier.published"];
      const result = publishedSchema.safeParse(validPublishedEvent);
      expect(result.success).toBe(true);
    });

    it("rejects mismatched dataschema using specialised schema", () => {
      const publishedSchema = supplierEvents["supplier.published"];
      const invalidEvent = {
        ...validPublishedEvent,
        dataschema:
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/supplier.disabled.1.0.0.schema.json",
      };
      const result = publishedSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects invalid subject", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        subject: "supplier/INVALID SUBJ",
      };
      const result = $SupplierEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("supplier.disabled event", () => {
    const validDisabledEvent = {
      specversion: "1.0",
      id: "7f2d3b64-4e65-4b1b-8c1c-bf3e5d222abc",
      source: "/control-plane/supplier-config",
      subject: "supplier/disabled-supplier",
      type: "uk.nhs.notify.supplier-config.supplier.disabled.v1",
      time: "2025-10-01T11:20:45.000Z",
      recordedtime: "2025-10-01T11:20:45.500Z",
      severitynumber: 2,
      severitytext: "INFO",
      datacontenttype: "application/json",
      dataschema:
        "https://notify.nhs.uk/cloudevents/schemas/supplier-config/supplier.disabled.1.0.0.schema.json",
      traceparent: "00-1bf8762027de54ee9559fc322d91430d-c8be7c2270314442-01",
      data: {
        id: SupplierId("disabled-supplier"),
        name: "Disabled Supplier",
        channelType: "LETTER",
        dailyCapacity: 5_000,
        status: "DISABLED",
      },
    };

    it("validates a supplier.disabled event with generic schema", () => {
      const result = $SupplierEvent.safeParse(validDisabledEvent);
      expect(result.success).toBe(true);
    });

    it("validates with specialised disabled schema", () => {
      const disabledSchema = supplierEvents["supplier.disabled"];
      const result = disabledSchema.safeParse(validDisabledEvent);
      expect(result.success).toBe(true);
    });

    it("rejects event with PUBLISHED status using disabled schema", () => {
      const disabledSchema = supplierEvents["supplier.disabled"];
      const invalidEvent = {
        ...validDisabledEvent,
        data: { ...validDisabledEvent.data, status: "PUBLISHED" },
      };
      const result = disabledSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("supplierEvents object", () => {
    it("contains published and disabled event schemas", () => {
      expect(supplierEvents["supplier.published"]).toBeDefined();
      expect(supplierEvents["supplier.disabled"]).toBeDefined();
    });
    it("does not contain draft event schema", () => {
      expect((supplierEvents as any)["supplier.draft"]).toBeUndefined();
    });
  });
});
