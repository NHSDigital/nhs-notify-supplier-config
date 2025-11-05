# CLI Tools

## parse-excel.ts

Parse an Excel file containing PackSpecification and LetterVariant sheets and convert them to domain objects.

### Usage

#### Using npm script (default input/output)

```bash
npm run parse:excel
```

This will:

- Read from: `src/examples/specifications.xlsx`
- Write to: `output/specifications.json`

#### Using ts-node with custom paths

```bash
ts-node src/cli/parse-excel.ts [inputFile] [outputFile]
```

**Arguments:**

- `inputFile` (optional): Path to the Excel file. Defaults to `src/examples/specifications.xlsx`
- `outputFile` (optional): Path to the output JSON file. Defaults to `output/specifications.json`

**Example:**

```bash
ts-node src/cli/parse-excel.ts ./my-specs.xlsx ./output/my-specs.json
```

### Excel File Format

The Excel file must contain two sheets:

#### PackSpecification Sheet

Columns:

- `id` (required): Unique identifier for the pack specification
- `name` (required): Name of the pack specification
- `status` (required): Status - one of "DRAFT", "PUBLISHED", "DISABLED"
- `version` (required): Version number as an integer (e.g., 1, 2, 3)
- `createdAt` (required): ISO date string
- `updatedAt` (required): ISO date string
- `envelopeId` (optional): Reference to an envelope ID
- `features` (optional): Comma-separated list of features (MAILMARK, BRAILLE, AUDIO, ADMAIL)

#### LetterVariant Sheet

Columns:

- `id` (required): Unique identifier for the letter variant
- `name` (required): Name of the letter variant
- `description` (optional): Description of the letter variant
- `packSpecificationIds` (required): Comma-separated list of pack specification IDs
- `type` (required): Type - one of "STANDARD", "BRAILLE", "AUDIO", "SAME_DAY"
- `status` (required): Status - one of "DRAFT", "PUBLISHED", "DISABLED"
- `clientId` (optional): Client identifier
- `campaignIds` (optional): Comma-separated list of campaign IDs

### Output Format

The script generates a JSON file with the following structure:

```json
{
  "packs": {
    "keyName": {
      "id": "pack-id",
      "name": "Pack Name",
      "status": "PUBLISHED",
      "version": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "assembly": {
        "envelopeId": "envelope-id",
        "features": ["BRAILLE"]
      }
    }
  },
  "variants": {
    "keyName": {
      "id": "variant-id",
      "name": "Variant Name",
      "description": "Description",
      "type": "STANDARD",
      "status": "PUBLISHED",
      "packSpecificationIds": ["pack-id-1", "pack-id-2"],
      "clientId": "client-id",
      "campaignIds": ["campaign-id-1"]
    }
  }
}
```

### Programmatic Usage

You can also import and use the parser in your own code:

```typescript
import parseExcelFile from "./cli/parse-excel";

const result = parseExcelFile("./path/to/specifications.xlsx");
console.log(result.packs);
console.log(result.variants);
```
