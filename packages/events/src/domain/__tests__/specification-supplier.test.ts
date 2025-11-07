import {
  $SpecificationSupplier,
  SpecificationSupplier,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/specification-supplier";
import {
  EnvelopeId,
  PackSpecification,
  PostageId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";

describe("SpecificationSupplier schema validation", () => {
  const standardLetterSpecification: PackSpecification = {
    id: "standard-letter" as any,
    name: "Standard Economy-class Letter",
    status: "PUBLISHED",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    version: 1,
    postage: {
      id: PostageId("economy"),
      size: "STANDARD",
      deliverySLA: 4,
    },
    assembly: {
      envelopeId: EnvelopeId("nhs-economy"),
      printColour: "BLACK",
      features: ["MAILMARK"],
    },
  };

  const testSpecificationSupplier: SpecificationSupplier = {
    id: "test-specification-supplier" as any,
    packSpecificationId: standardLetterSpecification.id,
    supplierId: "supplier-123" as any,
  };

  it("should validate a specification supplier", () => {
    expect(() =>
      $SpecificationSupplier.parse(testSpecificationSupplier),
    ).not.toThrow();
  });
});
