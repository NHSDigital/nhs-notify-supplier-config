import { z } from "zod";
import * as fs from "node:fs";
import packageJson from "@nhsdigital/nhs-notify-event-schemas-supplier-config/package.json";
import {$LetterVariant} from "../domain/letter-variant";
import {$PackSpecification} from "../domain/pack-specification";
import {$LetterVariantEvent, letterVariantEvents} from "../events/letter-variant-events";

const { version } = packageJson;

for (const [key, schema] of Object.entries({
  "letter-variant": $LetterVariant,
  "pack-specification": $PackSpecification
})) {
  const json = z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
    reused: "ref",
  });
  fs.mkdirSync("schemas/domain", { recursive: true });
  const file = `schemas/domain/${key}.schema.json`;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${file}`);
}

for (const [key, schema] of Object.entries(letterVariantEvents)) {
  const json = z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
    reused: "ref",
  });
  fs.mkdirSync("schemas/events", { recursive: true });
  const file = `schemas/events/${key}.schema.json`;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${file}`);
}

// Generic letter status change event schema
const json = z.toJSONSchema($LetterVariantEvent, {
  io: "input",
  target: "openapi-3.0",
  reused: "ref",
});
fs.mkdirSync("schemas/events", { recursive: true });
const file = `schemas/events/letter-variant.any.schema.json`;
fs.writeFileSync(file, JSON.stringify(json, null, 2));
console.info(`Wrote JSON schema for letter-variant.any to ${file}`);
