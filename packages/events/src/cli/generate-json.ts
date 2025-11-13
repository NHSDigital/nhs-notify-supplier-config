import { z } from "zod";
import * as fs from "node:fs";
import {
  $Contract,
  $LetterVariant,
  $PackSpecification,
  $SupplierAllocation,
  $SupplierPack,
} from "../domain";
import {
  $LetterVariantEvent,
  letterVariantEvents,
} from "../events/letter-variant-events";
import {
  $PackSpecificationEvent,
  packSpecificationEvents,
} from "../events/pack-specification-events";

for (const [key, schema] of Object.entries({
  "letter-variant": $LetterVariant,
  "pack-specification": $PackSpecification,
  "supplier-pack": $SupplierPack,
  contract: $Contract,
  "supplier-allocation": $SupplierAllocation,
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
fs.writeFileSync(packAnyFile, JSON.stringify(packAnySchema, null, 2));
console.info(`Wrote JSON schema for pack-specification.any to ${packAnyFile}`);
