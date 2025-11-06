import {
  $LetterVariantEvent,
  LetterVariantEvent,
  letterVariantEvents,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/events/letter-variant-events";
import { LetterVariantId } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";
import { PackSpecificationId } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";

describe("LetterVariant Events", () => {
  describe("letter-variant.published event", () => {
    const validPublishedEvent: LetterVariantEvent = {
      specversion: "1.0",
      id: "6f1c2a53-3d54-4a0a-9a0b-0e9ae2d4c111",
      source: "/control-plane/supplier-config",
      subject: "supplier-config/letter-variant/standard-letter-variant",
      type: "uk.nhs.notify.supplier-config.letter-variant.published.v1",
      time: "2025-10-01T10:15:30.000Z",
      recordedtime: "2025-10-01T10:15:30.250Z",
      severitynumber: 2,
      severitytext: "INFO",
      datacontenttype: "application/json",
      dataschema:
        "https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.published.1.0.0.schema.json",
      dataschemaversion: "1.0.0",
      traceparent: "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
      data: {
        id: LetterVariantId("standard-letter-variant"),
        name: "Standard Letter Variant",
        description: "A standard letter variant for general correspondence",
        type: "STANDARD",
        status: "PUBLISHED",
        packSpecificationIds: [
          PackSpecificationId("bau-standard-c5"),
          PackSpecificationId("bau-standard-c4"),
        ],
      },
    };

    it("should validate a valid letter-variant.published event", () => {
      const result = $LetterVariantEvent.safeParse(validPublishedEvent);
      expect(result.success).toBe(true);
    });

    it("should validate using the specialised published schema", () => {
      const publishedSchema = letterVariantEvents["letter-variant.published"];
      const result = publishedSchema.safeParse(validPublishedEvent);
      expect(result.success).toBe(true);
    });

    it("should validate event with optional fields", () => {
      const eventWithOptionalFields: LetterVariantEvent = {
        ...validPublishedEvent,
        data: {
          ...validPublishedEvent.data,
          clientId: "client-123",
          campaignIds: ["campaign-456", "campaign-789"],
        },
      };

      const result = $LetterVariantEvent.safeParse(eventWithOptionalFields);
      expect(result.success).toBe(true);
    });

    it("should validate BRAILLE type variant", () => {
      const brailleEvent: LetterVariantEvent = {
        ...validPublishedEvent,
        data: {
          id: LetterVariantId("braille-variant"),
          name: "Braille Letter Variant",
          type: "BRAILLE",
          status: "PUBLISHED",
          packSpecificationIds: [PackSpecificationId("braille")],
        },
      };

      const result = $LetterVariantEvent.safeParse(brailleEvent);
      expect(result.success).toBe(true);
    });

    it("should validate AUDIO type variant", () => {
      const audioEvent: LetterVariantEvent = {
        ...validPublishedEvent,
        data: {
          id: LetterVariantId("audio-variant"),
          name: "Audio Letter Variant",
          type: "AUDIO",
          status: "PUBLISHED",
          packSpecificationIds: [PackSpecificationId("audio")],
        },
      };

      const result = $LetterVariantEvent.safeParse(audioEvent);
      expect(result.success).toBe(true);
    });

    it("should validate SAME_DAY type variant", () => {
      const sameDayEvent: LetterVariantEvent = {
        ...validPublishedEvent,
        data: {
          id: LetterVariantId("same-day-variant"),
          name: "Same Day Letter Variant",
          type: "SAME_DAY",
          status: "PUBLISHED",
          packSpecificationIds: [PackSpecificationId("same-day")],
        },
      };

      const result = $LetterVariantEvent.safeParse(sameDayEvent);
      expect(result.success).toBe(true);
    });

    it("should reject event with invalid type", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        type: "uk.nhs.notify.supplier-config.letter-variant.invalid.v1",
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with invalid source", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        source: "/data-plane/invalid",
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with invalid subject", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        subject: "invalid/subject",
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with mismatched dataschema using specialized schema", () => {
      const publishedSchema = letterVariantEvents["letter-variant.published"];
      const invalidEvent = {
        ...validPublishedEvent,
        dataschema:
          "https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.disabled.1.0.0.schema.json",
      };

      const result = publishedSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with invalid dataschemaversion format", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        dataschemaversion: "2.0.0", // Major version must be 1
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with empty packSpecificationIds", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        data: {
          ...validPublishedEvent.data,
          packSpecificationIds: [],
        },
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should reject event with invalid letter type", () => {
      const invalidEvent = {
        ...validPublishedEvent,
        data: {
          ...validPublishedEvent.data,
          type: "INVALID_TYPE",
        },
      };

      const result = $LetterVariantEvent.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("should validate specialised schema enforces PUBLISHED status", () => {
      const publishedSchema = letterVariantEvents["letter-variant.published"];

      // Valid with PUBLISHED status
      const validResult = publishedSchema.safeParse(validPublishedEvent);
      expect(validResult.success).toBe(true);

      // Invalid with DISABLED status
      const invalidEvent = {
        ...validPublishedEvent,
        data: {
          ...validPublishedEvent.data,
          status: "DISABLED",
        },
      };
      const invalidResult = publishedSchema.safeParse(invalidEvent);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("letter-variant.disabled event", () => {
    const validDisabledEvent: LetterVariantEvent = {
      specversion: "1.0",
      id: "7f2d3b64-4e65-4b1b-8c1c-bf3e5d222abc",
      source: "/control-plane/supplier-config",
      subject: "supplier-config/letter-variant/disabled-letter-variant",
      type: "uk.nhs.notify.supplier-config.letter-variant.disabled.v1",
      time: "2025-10-01T11:20:45.000Z",
      recordedtime: "2025-10-01T11:20:45.500Z",
      severitynumber: 2,
      severitytext: "INFO",
      datacontenttype: "application/json",
      dataschema:
        "https://notify.nhs.uk/cloudevents/schemas/supplier-config/letter-variant.disabled.1.0.0.schema.json",
      dataschemaversion: "1.0.0",
      traceparent: "00-1bf8762027de54ee9559fc322d91430d-c8be7c2270314442-01",
      data: {
        id: LetterVariantId("disabled-letter-variant"),
        name: "Disabled Letter Variant",
        type: "STANDARD",
        status: "DISABLED",
        packSpecificationIds: [PackSpecificationId("bau-standard-c5")],
      },
    };

    it("should validate a valid letter-variant.disabled event", () => {
      const result = $LetterVariantEvent.safeParse(validDisabledEvent);
      expect(result.success).toBe(true);
    });

    it("should validate using the specialised disabled schema", () => {
      const disabledSchema = letterVariantEvents["letter-variant.disabled"];
      const result = disabledSchema.safeParse(validDisabledEvent);
      expect(result.success).toBe(true);
    });

    it("should validate specialised schema enforces DISABLED status", () => {
      const disabledSchema = letterVariantEvents["letter-variant.disabled"];

      // Valid with DISABLED status
      const validResult = disabledSchema.safeParse(validDisabledEvent);
      expect(validResult.success).toBe(true);

      // Invalid with PUBLISHED status
      const invalidEvent = {
        ...validDisabledEvent,
        data: {
          ...validDisabledEvent.data,
          status: "PUBLISHED",
        },
      };
      const invalidResult = disabledSchema.safeParse(invalidEvent);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("letterVariantEvents object", () => {
    it("should contain published and disabled event schemas", () => {
      expect(letterVariantEvents["letter-variant.published"]).toBeDefined();
      expect(letterVariantEvents["letter-variant.disabled"]).toBeDefined();
    });

    it("should not contain draft event schema", () => {
      expect(letterVariantEvents["letter-variant.draft"]).toBeUndefined();
    });
  });
});
