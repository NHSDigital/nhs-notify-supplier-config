import { z } from "zod";
import * as fs from "node:fs";
import packageJson from "@nhsdigital/nhs-notify-event-schemas-supplier-config/package.json";
import { $LetterVariant } from "../domain/letter-variant";
import { $PackSpecification } from "../domain/pack-specification";
import {
  $LetterVariantEvent,
  letterVariantEvents,
} from "../events/letter-variant-events";
import {
  $PackSpecificationEvent,
  packSpecificationEvents,
} from "../events/pack-specification-events";

// version currently unused; retained for future tagging of schema output
const { version } = packageJson; // eslint-disable-line @typescript-eslint/no-unused-vars

for (const [key, schema] of Object.entries({
  "letter-variant": $LetterVariant,
  "pack-specification": $PackSpecification,
})) {
  const jsonSchema = z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
    reused: "ref",
  });
  fs.mkdirSync("schemas/domain", { recursive: true });
  const outFile = `schemas/domain/${key}.schema.json`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(outFile, JSON.stringify(jsonSchema, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${outFile}`);
}

for (const [key, schema] of Object.entries(letterVariantEvents)) {
  const jsonSchema = z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
    reused: "ref",
  });
  fs.mkdirSync("schemas/events", { recursive: true });
  const outFile = `schemas/events/${key}.schema.json`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(outFile, JSON.stringify(jsonSchema, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${outFile}`);
}

const letterAnySchema = z.toJSONSchema($LetterVariantEvent, {
  io: "input",
  target: "openapi-3.0",
  reused: "ref",
});
fs.mkdirSync("schemas/events", { recursive: true });
const letterAnyFile = `schemas/events/letter-variant.any.schema.json`;
// eslint-disable-next-line security/detect-non-literal-fs-filename
fs.writeFileSync(letterAnyFile, JSON.stringify(letterAnySchema, null, 2));
console.info(`Wrote JSON schema for letter-variant.any to ${letterAnyFile}`);

for (const [key, schema] of Object.entries(packSpecificationEvents)) {
  const jsonSchema = z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
    reused: "ref",
  });
  fs.mkdirSync("schemas/events", { recursive: true });
  const outFile = `schemas/events/${key}.schema.json`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(outFile, JSON.stringify(jsonSchema, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${outFile}`);
}

const packAnySchema = z.toJSONSchema($PackSpecificationEvent, {
  io: "input",
  target: "openapi-3.0",
  reused: "ref",
});
fs.mkdirSync("schemas/events", { recursive: true });
const packAnyFile = `schemas/events/pack-specification.any.schema.json`;
// eslint-disable-next-line security/detect-non-literal-fs-filename
fs.writeFileSync(packAnyFile, JSON.stringify(packAnySchema, null, 2));
console.info(`Wrote JSON schema for pack-specification.any to ${packAnyFile}`);
