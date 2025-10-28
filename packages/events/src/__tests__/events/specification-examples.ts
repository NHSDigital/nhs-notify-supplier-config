import {
  EnvelopeId,
  Pack,
  PackId,
  SpecificaitonId,
  Specification,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/specification";
import { Version } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";

const bauStandardC5: Pack = {
  id: PackId("bau-standard-c5"),
  name: "BAU Standard Letter C5",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c5-economy"),
  },
};

const bauStandardC4: Pack = {
  id: PackId("bau-standard-c4"),
  name: "BAU Standard Letter C4",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-economy"),
  },
};

const braille: Pack = {
  id: PackId("braille"),
  name: "Braille Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    features: ["BRAILLE"],
  },
};

const audio: Pack = {
  id: PackId("audio"),
  name: "Audio Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    features: ["AUDIO"],
  },
};

const sameDay: Pack = {
  id: PackId("same-day"),
  name: "Same Day Letter",
  status: "PUBLISHED",
  version: Version("1.0.0"),
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-same-day"),
  },
};

const digitrials1: Pack = {
  id: PackId("digitrials1"),
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

const specifications: Record<string, Specification> = {
  bauStandard: {
    id: SpecificaitonId("bau-standard"),
    name: "BAU Standard Letter",
    description: "BAU Standard Letter",
    packIds: [bauStandardC5.id, bauStandardC4.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
  },
  braille: {
    id: SpecificaitonId("braille"),
    name: "Braille Letter",
    description: "Braille Letter",
    packIds: [braille.id],
    specificationType: "LETTER_BRAILLE",
    status: "PUBLISHED",
  },
  audio: {
    id: SpecificaitonId("audio"),
    name: "Audio Letter",
    description: "Audio Letter",
    packIds: [audio.id],
    specificationType: "LETTER_AUDIO",
    status: "PUBLISHED",
  },
  sameDay: {
    id: SpecificaitonId("same-day"),
    name: "Same Day Letter",
    description: "Same Day Letter",
    packIds: [sameDay.id],
    specificationType: "LETTER_SAME_DAY",
    status: "PUBLISHED",
  },
  digitrials1: {
    id: SpecificaitonId("digitrials1"),
    name: "Digitrials Letter Specification 1",
    description: "Digitrials Letter Pack 1",
    packIds: [digitrials1.id],
    specificationType: "LETTER_STANDARD",
    status: "PUBLISHED",
    clientId: "digitrials",
    campaignIds: ["digitrials-campaign-1"],
  },
};

console.log(JSON.stringify(specifications, null, 2));
