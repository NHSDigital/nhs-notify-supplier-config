import {
  $PackSpecification,
  EnvelopeId,
  PackSpecification,
  PackSpecificationId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { $Version } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";

describe("Specification schema validation", () => {
  const standardLetterSpecification: PackSpecification = {
    id: PackSpecificationId("standard-letter"),
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

  it("should validate a standard letter specification", () => {
    expect(() =>
      $PackSpecification.strict().parse(standardLetterSpecification),
    ).not.toThrow();
  });

  it("should accept a letter specification with unrecognised fields", () => {
    expect(() =>
      $PackSpecification.parse({
        ...standardLetterSpecification,
        additionalField: { some: "data" },
      }),
    ).not.toThrow();
  });
});
