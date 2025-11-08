import {
  $EnvelopeProfile,
  EnvelopeProfile,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/envelope-profile";

describe("EnvelopeProfile schema validation", () => {
  const baseValidEnvelope: EnvelopeProfile = {
    specversion: "1.0",
    id: "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111",
    source: "/data-plane/ordering",
    subject: "customer/920fca11-596a-4eca-9c47-99f624614658/order/769acdd4",
    type: "uk.nhs.notify.ordering.order.read",
    time: "2025-10-01T10:15:30.000Z",
    data: {
      "notify-payload": {
        "notify-data": { nhsNumber: "9434765919" },
        "notify-metadata": {
          teamResponsible: "Team 1",
          notifyDomain: "Ordering",
          version: "1.3.0",
        },
      },
    },
    traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
    recordedtime: "2025-10-01T10:15:30.250Z",
    severitynumber: 2,
    severitytext: "INFO",
  };

  describe("basic validation", () => {
    it("should validate a valid envelope", () => {
      const result = $EnvelopeProfile.safeParse(baseValidEnvelope);
      expect(result.success).toBe(true);
    });

    it("should validate control-plane source", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/control-plane/audit",
        subject: "audit-log/12345",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });
  });

  describe("superRefine: data-plane subject validation", () => {
    it("should accept valid data-plane subject with namespace/id pattern", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/data-plane/ordering",
        subject: "customer/920fca11-596a-4eca-9c47-99f624614658/order/769acdd4",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept data-plane subject with multiple segments", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/data-plane/ordering",
        subject:
          "origin/920fca11-596a-4eca-9c47-99f624614658/order/769acdd4-6a47-496f-999f-76a6fd2c3959/item/4f5e17c0-ec57-4cee-9a86-14580cf5af7d",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should reject data-plane subject without namespace/id pattern", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/data-plane/ordering",
        subject: "single-segment",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject data-plane subject with only one segment after namespace", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/data-plane/ordering",
        subject: "customer",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should accept control-plane subject without namespace/id requirement", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/control-plane/audit",
        subject: "single-segment",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept control-plane subject with any format", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/control-plane/config",
        subject: "config/settings/database",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });
  });

  describe("superRefine: severity text and number validation", () => {
    it("should accept TRACE with severitynumber 0", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "TRACE",
        severitynumber: 0,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept DEBUG with severitynumber 1", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "DEBUG",
        severitynumber: 1,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept INFO with severitynumber 2", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "INFO",
        severitynumber: 2,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept WARN with severitynumber 3", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "WARN",
        severitynumber: 3,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept ERROR with severitynumber 4", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "ERROR",
        severitynumber: 4,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept FATAL with severitynumber 5", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "FATAL",
        severitynumber: 5,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should reject TRACE with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "TRACE",
        severitynumber: 1,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject DEBUG with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "DEBUG",
        severitynumber: 2,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject INFO with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "INFO",
        severitynumber: 1,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject WARN with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "WARN",
        severitynumber: 2,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject ERROR with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "ERROR",
        severitynumber: 3,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject FATAL with incorrect severitynumber", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        severitytext: "FATAL",
        severitynumber: 4,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject severitynumber without severitytext", () => {
      const envelope = {
        ...baseValidEnvelope,
        severitytext: undefined,
        severitynumber: 2,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should accept severitytext without severitynumber (optional)", () => {
      const envelope = {
        ...baseValidEnvelope,
        severitytext: "INFO",
        severitynumber: 2,
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });
  });

  describe("optional fields validation", () => {
    it("should accept envelope with all optional fields", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        datacontenttype: "application/json",
        dataschema: "https://example.com/schema.json",
        tracestate: "rojo=00f067aa0ba902b7",
        partitionkey: "customer-920fca11",
        sampledrate: 5,
        sequence: "00000000000000000042",
        severitytext: "DEBUG",
        severitynumber: 1,
        dataclassification: "restricted",
        dataregulation: "GDPR",
        datacategory: "sensitive",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should accept envelope without optional fields", () => {
      const envelope: EnvelopeProfile = {
        specversion: "1.0",
        id: "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111",
        source: "/data-plane/ordering",
        subject: "customer/920fca11/order/769acdd4",
        type: "uk.nhs.notify.ordering.order.read",
        time: "2025-10-01T10:15:30.000Z",
        data: { "notify-payload": {} },
        traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
        recordedtime: "2025-10-01T10:15:30.250Z",
        severitynumber: 2,
        severitytext: "INFO",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle data-plane source with multiple path segments", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/data-plane/ordering/subsystem",
        subject: "customer/123/order/456",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should handle control-plane source with multiple path segments", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/control-plane/audit/security",
        subject: "audit-log",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(true);
    });

    it("should reject invalid source pattern", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        source: "/invalid-plane/test",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });

    it("should reject invalid event type with forbidden verbs", () => {
      const envelope: EnvelopeProfile = {
        ...baseValidEnvelope,
        type: "uk.nhs.notify.ordering.order.completed",
      };

      const result = $EnvelopeProfile.safeParse(envelope);
      expect(result.success).toBe(false);
    });
  });
});
