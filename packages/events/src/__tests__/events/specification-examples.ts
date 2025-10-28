import {
  EnvelopeId,
  SpecificaitonGroupId,
  Specification,
  SpecificationGroup,
  SpecificationId,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/specification";
import { Version } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";

const bauStandardC5: Specification = {
  id: SpecificationId("bau-standard-c5"),
  name: "BAU Standard Letter C5",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_STANDARD",
  pack: {
    envelopeId: EnvelopeId("envelope-nhs-c5-economy"),
  },
};

const bauStandardC4: Specification = {
  id: SpecificationId("bau-standard-c4"),
  name: "BAU Standard Letter C4",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_STANDARD",
  pack: {
    envelopeId: EnvelopeId("envelope-nhs-c4-economy"),
  },
};

const braille: Specification = {
  id: SpecificationId("braille"),
  name: "Braille Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_BRAILLE",
};

const audio: Specification = {
  id: SpecificationId("audio"),
  name: "Audio Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_AUDIO",
};

const sameDay: Specification = {
  id: SpecificationId("same-day"),
  name: "Same Day Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_SAME_DAY",
  pack: {
    envelopeId: EnvelopeId("envelope-nhs-c4-same-day"),
  },
};

const digitrials1: Specification = {
  id: SpecificationId("digitrials1"),
  name: "Digitrials Letter Pack 1",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  specificationType: "LETTER_STANDARD",
  pack: {
    envelopeId: EnvelopeId("digitrials-envelope1-c5"),
  },
};

const specifications = {
  bauStandardC5,
  bauStandardC4,
  braille,
  audio,
  sameDay,
};

const specificationGroups: Record<string, SpecificationGroup> = {
  bauStandard: {
    id: SpecificaitonGroupId("bau-standard"),
    name: "BAU Standard Letter",
    description: "BAU Standard Letter",
    specificationIds: [bauStandardC5.id, bauStandardC4.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
  },
  braille: {
    id: SpecificaitonGroupId("braille"),
    name: "Braille Letter",
    description: "Braille Letter",
    specificationIds: [braille.id],
    specificationType: "LETTER_BRAILLE",
    status: "PUBLISHED",
  },
  audio: {
    id: SpecificaitonGroupId("audio"),
    name: "Audio Letter",
    description: "Audio Letter",
    specificationIds: [audio.id],
    specificationType: "LETTER_AUDIO",
    status: "PUBLISHED",
  },
  sameDay: {
    id: SpecificaitonGroupId("same-day"),
    name: "Same Day Letter",
    description: "Same Day Letter",
    specificationIds: [sameDay.id],
    specificationType: "LETTER_SAME_DAY",
    status: "PUBLISHED",
  },
  digitrials1: {
    id: SpecificaitonGroupId("digitrials1"),
    name: "Digitrials Letter Pack 1",
    description: "Digitrials Letter Pack 1",
    specificationIds: [digitrials1.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
    clientId: "digitrials",
    campaignIds: ["digitrials-campaign-1"],
  },
};

console.log(JSON.stringify({ specifications, specificationGroups }, null, 2));
