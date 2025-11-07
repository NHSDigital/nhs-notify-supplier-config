import { generateMermaidDiagram } from "zod-mermaid";
import fs from "node:fs";
import path from "node:path";
import { $LetterVariant } from "../domain/letter-variant";
import { $PackSpecification } from "../domain/pack-specification";

// eslint-disable-next-line security/detect-non-literal-fs-filename
const out = fs.openSync(`${path.dirname(__filename)}/../domain/erd.md`, "w");

fs.writeSync(
  out,
  `# Event domain ERD

This document contains the mermaid diagrams for the event domain model.

The schemas are generated from Zod definitions and provide a visual representation of the data structure.
`,
);

for (const [name, schema] of Object.entries({
  LetterVariant: [$LetterVariant],
  PackSpecification: [$PackSpecification],
})) {
  const mermaid = generateMermaidDiagram(schema);
  fs.writeSync(
    out,
    `
## ${name} schema

\`\`\`mermaid
${mermaid}
\`\`\`
`,
  );
}

fs.closeSync(out);
