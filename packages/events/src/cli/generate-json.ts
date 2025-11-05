import { z } from "zod";
import * as fs from "node:fs";
import packageJson from "@nhsdigital/nhs-notify-event-schemas-supplier-config/package.json";

const { version } = packageJson;

for (const [key, schema] of Object.entries({
  // 'client-changed': $ClientChangedEvent
})) {
  const json = z.toJSONSchema(schema);
  const file = `json/${key}-${version}.json`;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  console.info(`Wrote JSON schema for ${key} to ${file}`);
}
