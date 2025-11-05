import {
  $SpecificationSupplier,
  SpecificationSupplier,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/specification-supplier";
import {
  EnvelopeId,
  PackSpecification,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { $Version } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";

describe("SpecificationSupplier schema validation", () => {
  const standardLetterSpecification: PackSpecification = {
    id: "standard-letter" as any,
    name: "Standard Economy-class Letter",
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
    version: $Version.parse("1.0.0"),
    postage: {
      tariff: "economy",
      size: "letter",
      deliverySLA: 4,
      maxSheets: 5,
    },
    assembly: {
      envelopeId: EnvelopeId("nhs-economy"),
      printColour: "BLACK",
      features: ["MAILMARK"],
    },
  };

  const testSpecificationSupplier: SpecificationSupplier = {
    id: "test-specification-supplier" as any,
    specificationId: standardLetterSpecification.id,
    supplierId: "supplier-123" as any,
  };

  it("should validate a specification supplier", () => {
    expect(() =>
      $SpecificationSupplier.parse(testSpecificationSupplier),
    ).not.toThrow();
  });
});
