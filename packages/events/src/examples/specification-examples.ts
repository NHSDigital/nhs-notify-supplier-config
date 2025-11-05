import {
  LetterVariant,
  LetterVariantId,
} from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/letter-variant";
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

const variants: Record<string, LetterVariant> = {
  bauStandard: {
    id: LetterVariantId("bau-standard"),
    name: "BAU Standard Letter",
    description: "BAU Standard Letter",
    packSpecificationIds: [bauStandardC5.id, bauStandardC4.id],
    type: "STANDARD",
    status: "PUBLISHED",
  },
  braille: {
    id: LetterVariantId("braille"),
    name: "Braille Letter",
    description: "Braille Letter",
    packSpecificationIds: [braille.id],
    type: "BRAILLE",
    status: "PUBLISHED",
  },
  audio: {
    id: LetterVariantId("audio"),
    name: "Audio Letter",
    description: "Audio Letter",
    packSpecificationIds: [audio.id],
    type: "AUDIO",
    status: "PUBLISHED",
  },
  sameDay: {
    id: LetterVariantId("same-day"),
    name: "Same Day Letter",
    description: "Same Day Letter",
    packSpecificationIds: [sameDay.id],
    type: "SAME_DAY",
    status: "PUBLISHED",
  },
  digitrials1: {
    id: LetterVariantId("digitrials1"),
    name: "Digitrials Letter Variant 1",
    description: "Digitrials Letter Variant 1",
    packSpecificationIds: [digitrials1.id],
    type: "STANDARD",
    status: "PUBLISHED",
    clientId: "digitrials",
    campaignIds: ["digitrials-campaign-1"],
  },
};

// eslint-disable-next-line no-console
console.log(JSON.stringify({ packs, variants }, null, 2));
