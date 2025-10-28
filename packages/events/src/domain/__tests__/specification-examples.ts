import {
  TemplateSpecificaitonId,
  TemplateSpecification,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/template-specification";
import { Version } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";
import {
  EnvelopeId,
  PackSpecification,
  PackSpecificationId,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/pack-specification";

const bauStandardC5: PackSpecification = {
  id: PackSpecificationId("bau-standard-c5"),
  name: "BAU Standard Letter C5",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c5-economy"),
  },
};

const bauStandardC4: PackSpecification = {
  id: PackSpecificationId("bau-standard-c4"),
  name: "BAU Standard Letter C4",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-economy"),
  },
};

const braille: PackSpecification = {
  id: PackSpecificationId("braille"),
  name: "Braille Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    features: ["BRAILLE"],
  },
};

const audio: PackSpecification = {
  id: PackSpecificationId("audio"),
  name: "Audio Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    features: ["AUDIO"],
  },
};

const sameDay: PackSpecification = {
  id: PackSpecificationId("same-day"),
  name: "Same Day Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-same-day"),
  },
};

const digitrials1: PackSpecification = {
  id: PackSpecificationId("digitrials1"),
  name: "Digitrials Letter Pack 1",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("digitrials-envelope1-c5"),
    features: ["ADMAIL"],
  },
};

const packs = {
  bauStandardC5,
  bauStandardC4,
  braille,
  audio,
  sameDay,
};

const specifications: Record<string, TemplateSpecification> = {
  bauStandard: {
    id: TemplateSpecificaitonId("bau-standard"),
    name: "BAU Standard Letter",
    description: "BAU Standard Letter",
    packSpecificationIds: [bauStandardC5.id, bauStandardC4.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
  },
  braille: {
    id: TemplateSpecificaitonId("braille"),
    name: "Braille Letter",
    description: "Braille Letter",
    packSpecificationIds: [braille.id],
    specificationType: "LETTER_BRAILLE",
    status: "PUBLISHED",
  },
  audio: {
    id: TemplateSpecificaitonId("audio"),
    name: "Audio Letter",
    description: "Audio Letter",
    packSpecificationIds: [audio.id],
    specificationType: "LETTER_AUDIO",
    status: "PUBLISHED",
  },
  sameDay: {
    id: TemplateSpecificaitonId("same-day"),
    name: "Same Day Letter",
    description: "Same Day Letter",
    packSpecificationIds: [sameDay.id],
    specificationType: "LETTER_SAME_DAY",
    status: "PUBLISHED",
  },
  digitrials1: {
    id: TemplateSpecificaitonId("digitrials1"),
    name: "Digitrials Letter Specification 1",
    description: "Digitrials Letter Pack 1",
    packSpecificationIds: [digitrials1.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
    clientId: "digitrials",
    campaignIds: ["digitrials-campaign-1"],
  },
};

console.log(JSON.stringify(specifications, null, 2));
