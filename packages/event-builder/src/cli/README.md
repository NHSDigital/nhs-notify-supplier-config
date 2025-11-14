# Events CLI Tools

The `events` CLI lets you:

1. Parse a supplier configuration Excel workbook into validated domain JSON.
2. Publish CloudEvents for all parsed entities to AWS EventBridge.

It replaces the previous standalone `parse-excel.ts` script. All logic now lives in `src/cli/events.ts`.

---

## Quick Start

```bash
# From inside the event-builder package directory:
npm run cli:events -- parse -f examples/specifications.xlsx
npm run cli:events -- publish -f examples/specifications.xlsx -b my-bus -r eu-west-2 --dry-run

# From the repository root (use workspace flag and full path to examples):
npm run cli:events --workspace event-builder -- parse -f packages/event-builder/examples/specifications.xlsx
npm run cli:events --workspace event-builder -- publish -f packages/event-builder/examples/specifications.xlsx -b my-bus -r eu-west-2
```

Alternative direct ts-node invocation:

```bash
npx ts-node packages/event-builder/src/cli/events.ts parse -f packages/event-builder/examples/specifications.xlsx
```

---

## Commands

### parse

Parses the Excel workbook and writes the full JSON model to stdout.

Options:

- `-f, --file` (string, default: `specifications.xlsx`): Path to the Excel file.

### publish

Builds and publishes events (Contract, Supplier, PackSpecification, SupplierPack, LetterVariant, SupplierAllocation) to EventBridge.

Options:

- `-f, --file` (string, default: `specifications.xlsx`): Path to the Excel file.
- `-b, --bus` (string, required): EventBridge bus name.
- `-r, --region` (string, optional): AWS region (falls back to `AWS_REGION` / `AWS_DEFAULT_REGION`).
- `--dry-run` (boolean, default: false): Build events but do not send them (prints first event if present).

Event ordering & sequencing:

1. Contracts
2. Suppliers
3. PackSpecifications
4. SupplierPacks
5. LetterVariants
6. SupplierAllocations

A monotonically increasing 20-digit zero-padded `sequence` is applied across categories. Draft contracts are skipped at event build time (they produce `undefined` and are not published).

### template

Generates a blank Excel workbook with all required sheets and column headers.

Options:

- `-o, --out` (string, default: `specifications.template.xlsx`): Output path (must end with .xlsx)
- `-F, --force` (boolean, default: false): Overwrite if file already exists

Examples:

```bash
# Generate template (non-destructive)
npm run cli:events -- template

# Overwrite existing file
npm run cli:events -- template -o specs.xlsx --force

# From repo root with workspace flag
npm run cli:events --workspace event-builder -- template -o packages/event-builder/examples/new-specs.xlsx
```

---

## Excel Workbook Format

The workbook MUST contain ALL of the following sheets (case-sensitive names):
`PackSpecification`, `LetterVariant`, `Contract`, `Supplier`, `SupplierAllocation`, `SupplierPack`.

Each sheet row becomes a domain object validated by its Zod schema. Invalid rows cause the whole parse to fail with a detailed error.

### PackSpecification Sheet Columns

Required:

- `id`: Unique pack specification ID.
- `name`
- `status`: `DRAFT | PUBLISHED | DISABLED`
- `version`: Integer (e.g. `1`)
- `createdAt`: RFC3339 datetime (invalid or missing defaults to `2023-01-01T00:00:00Z`)
- `updatedAt`: RFC3339 datetime (same default behavior)
- `postage.id`: Postage ID
- `postage.size`: `STANDARD | LARGE`

Optional:

- `billingId`
- `postage.deliverySLA`: Integer days
- `postage.maxWeight`: Number (grams)
- `postage.maxThickness`: Number (mm)
- Constraint fields:
  - `constraints.maxSheets`
  - `constraints.deliverySLA`
  - `constraints.blackCoveragePercentage`
  - `constraints.colourCoveragePercentage`
- Assembly fields:
  - `assembly.envelopeId`
  - `assembly.printColour`: `BLACK | COLOUR`
  - `assembly.paper.id`
  - `assembly.paper.name`
  - `assembly.paper.weightGSM` (defaults to `80` if paper provided but weight missing)
  - `assembly.paper.size`: `A4 | A3`
  - `assembly.paper.colour`: `WHITE | COLOURED`
  - `assembly.paper.recycled`: `true | false | TRUE | FALSE`
  - `assembly.insertIds`: Comma-separated list
  - `assembly.features`: Comma-separated subset of `MAILMARK,BRAILLE,AUDIO,ADMAIL`
  - `assembly.additional`: JSON string (ignored if invalid)

### LetterVariant Sheet Columns

Required:

- `id`
- `name`
- `contractId`: Must reference a Contract row `id`
- `packSpecificationIds`: Comma-separated list of PackSpecification IDs
- `type`: `STANDARD | BRAILLE | AUDIO | SAME_DAY`
- `status`: `DRAFT | PUBLISHED | DISABLED`

Optional:

- `description` (defaults to `name` if absent)
- `clientId`
- `campaignIds`: Comma-separated list
- Constraint fields (same keys as PackSpecification):
  - `constraints.maxSheets`
  - `constraints.deliverySLA`
  - `constraints.blackCoveragePercentage`
  - `constraints.colourCoveragePercentage`

### Contract Sheet Columns

Required:

- `id`
- `name`
- `startDate`: Date only (`YYYY-MM-DD`). Missing or invalid defaults to `2023-01-01`.

Optional:

- `description`
- `endDate`: Date only (`YYYY-MM-DD`)
- `status`: `DRAFT | PUBLISHED | DISABLED` (defaults to `PUBLISHED` if omitted)

### Supplier Sheet Columns

Required:

- `id`
- `name`
- `channelType`: `NHSAPP | SMS | EMAIL | LETTER`

### SupplierAllocation Sheet Columns

Required:

- `id`
- `contract`: Contract ID
- `supplier`: Supplier ID
- `allocationPercentage`: Number (0–100 inclusive)
- `status`: `PUBLISHED | DISABLED` (per underlying schema)

### SupplierPack Sheet Columns

Required:

- `id`
- `packSpecificationId`
- `supplierId`
- `status`: One of lifecycle states (`SUBMITTED | APPROVED | REJECTED | DISABLED`)

---

## Output (parse command)

`parse` emits a JSON object:

```jsonc
{
  "packs": { "packid": { /* PackSpecification */ } },
  "variants": { "variantid": { /* LetterVariant */ } },
  "contracts": { "contractid": { /* Contract */ } },
  "suppliers": { "supplierid": { /* Supplier */ } },
  "allocations": { "allocationid": { /* SupplierAllocation */ } },
  "supplierPacks": { "supplierpackid": { /* SupplierPack */ } }
}
```

Keys are sanitized (non-alphanumeric characters removed) to create stable object property names.

Example (abbreviated):

```json
{
  "contracts": {
    "contractx": { "id": "contract-x", "name": "Contract X", "startDate": "2025-01-01", "status": "PUBLISHED" }
  },
  "packs": {
    "pack1": {
      "id": "pack-1",
      "name": "Pack 1",
      "status": "PUBLISHED",
      "version": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "postage": { "id": "postage-1", "size": "STANDARD" }
    }
  }
}
```

---

## Validation & Errors

All rows are validated with Zod schemas from `@nhsdigital/nhs-notify-event-schemas-supplier-config`.

Typical validation failures:

- Invalid enum values (e.g. status/type/channelType)
- Missing required columns (e.g. `postage.id`, `packSpecificationIds`)
- Bad numeric conversions (non-numeric where number expected)
- Out-of-range allocation percentages (<0 or >100)
- Invalid dates (defaulting for some fields, but still may fail if schema requires a format)

On failure a JSON array of issues is included in the thrown error string:

```text
Validation failed for PackSpecification 'pack-xyz': [{"code":"invalid_enum_value","path":["status"],...}]
```

---

## Publish Behavior

- Each built CloudEvent envelope includes severity (default INFO) and a lexicographically sortable 20-digit `sequence` (padded).
- Draft contracts are ignored (no Contract event produced).
- Batches of up to 10 entries are sent per PutEvents call.
- On `--dry-run` the first event is printed and no AWS calls are made.
- Any failed EventBridge batch sets a non-zero process exit code.

Environment:

- Requires AWS credentials (e.g., via environment, profile, or SSO).
- Region resolution order: `--region` flag > `AWS_REGION`/`AWS_DEFAULT_REGION` env.

---

## Programmatic Use

You can reuse the parser directly:

```typescript
import { parseExcelFile } from "event-builder/src/lib/parse-excel";

const data = parseExcelFile("./specifications.xlsx");
console.log(data.contracts, data.packs);
```

Or build events manually:

```typescript
import { buildContractEvents } from "event-builder/src/contract-event-builder";
const contractEvents = buildContractEvents(data.contracts);
```

---

## Examples

Parse only:

```bash
events parse -f supplier-config.xlsx > output.json
```

Publish with dry-run:

```bash
events publish -f supplier-config.xlsx -b my-bus -r eu-west-2 --dry-run
```

Full publish:

```bash
events publish -f supplier-config.xlsx -b prod-supplier-config -r eu-west-2
```

---

## Troubleshooting

- Ensure all required sheets exist exactly with required names.
- Confirm `.xlsx` extension; other formats are rejected.
- If validation errors mention missing postage fields, verify both `postage.id` and `postage.size` are present.
- Sequence gaps for skipped draft contracts are expected.
- Use `--dry-run` to inspect an example event before publishing.

---

## Future Enhancements (Potential)

- Optional output file for `parse` command.
- Filtering by status before publishing.
- Summary table of validation issues without hard failure.

Feel free to extend `events.ts`—it is structured for additional subcommands.
