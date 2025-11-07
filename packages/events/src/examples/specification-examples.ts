import {
  LetterVariant,
  LetterVariantId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";
import {
  EnvelopeId,
  PackSpecification,
  PackSpecificationId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";

const bauStandardC5: PackSpecification = {
  id: PackSpecificationId("bau-standard-c5"),
  name: "BAU Standard Letter C5",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "ECONOMY",
    size: "STANDARD",
    maxSheets: 6,
    deliverySLA: 3,
  },
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c5-economy"),
    printColour: "BLACK",
  },
};

const bauStandardC4: PackSpecification = {
  id: PackSpecificationId("bau-standard-c4"),
  name: "BAU Standard Letter C4",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "ECONOMY",
    size: "LARGE",
    maxSheets: 10,
    deliverySLA: 3,
  },
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-economy"),
    printColour: "BLACK",
  },
};

const braille: PackSpecification = {
  id: PackSpecificationId("braille"),
  name: "Braille Letter",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "ARTICLES_BLIND",
    size: "STANDARD",
  },
  assembly: {
    features: ["BRAILLE"],
    printColour: "BLACK",
  },
};

const audio: PackSpecification = {
  id: PackSpecificationId("audio"),
  name: "Audio Letter",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "ARTICLES_BLIND",
    size: "STANDARD",
  },
  assembly: {
    features: ["AUDIO"],
    printColour: "BLACK",
  },
};

const sameDay: PackSpecification = {
  id: PackSpecificationId("same-day"),
  name: "Same Day Letter",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "FIRST",
    size: "LARGE",
    deliverySLA: 0,
  },
  assembly: {
    envelopeId: EnvelopeId("envelope-nhs-c4-same-day"),
    printColour: "COLOUR",
  },
};

const clientPack1: PackSpecification = {
  id: PackSpecificationId("client1-campaign1"),
  name: "Client1 Letter Pack 1",
  status: "PUBLISHED",
  version: 1,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  postage: {
    tariff: "ADMAIL",
    size: "STANDARD",
    deliverySLA: 3,
  },
  assembly: {
    envelopeId: EnvelopeId("client1-envelope1-c5"),
    features: ["ADMAIL"],
    printColour: "COLOUR",
  },
};

const packs = {
  bauStandardC5,
  bauStandardC4,
  braille,
  audio,
  sameDay,
  clientPack1,
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
    id: LetterVariantId("client1"),
    name: "Client 1 Letter Variant 1",
    description: "Client 1 Letter Variant 1",
    packSpecificationIds: [clientPack1.id],
    type: "STANDARD",
    status: "PUBLISHED",
    clientId: "client1",
    campaignIds: ["client1-campaign1"],
  },
};

// eslint-disable-next-line no-console
console.log(JSON.stringify({ packs, variants }, null, 2));
