// eslint-disable-next-line import-x/no-extraneous-dependencies
import * as XLSX from "xlsx";
import * as fs from "node:fs";
import path from "node:path";
import {
  EnvelopeId,
  PackSpecification,
  PackSpecificationId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import {
  LetterVariant,
  LetterVariantId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/letter-variant";

interface PackSpecificationRow {
  id: string;
  name: string;
  status: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  envelopeId?: string;
  features?: string;
  "assembly.envelopeId"?: string;
  "assembly.features"?: string;
}

interface LetterVariantRow {
  id: string;
  name: string;
  description?: string;
  packSpecificationIds: string;
  type: string;
  status: string;
  clientId?: string;
  campaignIds?: string;
}

/**
 * Parse a date string or return a default ISO datetime string
 */
function parseDate(dateStr: string | undefined): string {
  if (!dateStr) {
    return "2023-01-01T00:00:00Z";
  }
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? "2023-01-01T00:00:00Z"
    : date.toISOString();
}

/**
 * Parse comma-separated string into array
 */
function parseArray(value: string | undefined): string[] | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value.split(",").map((item) => item.trim());
}

/**
 * Parse PackSpecification from Excel row
 */
function parsePackSpecification(row: PackSpecificationRow): PackSpecification {
  const pack: PackSpecification = {
    id: PackSpecificationId(row.id),
    name: row.name,
    status: row.status as "DRAFT" | "PUBLISHED" | "DISABLED",
    version: Number.parseInt(row.version, 10),
    createdAt: parseDate(row.createdAt),
    updatedAt: parseDate(row.updatedAt),
  };

  // Build assembly object if needed
  const assembly: NonNullable<PackSpecification["assembly"]> = {};
  let hasAssembly = false;

  // Handle both flat and nested property names
  const envelopeId = row["assembly.envelopeId"] || row.envelopeId;
  if (envelopeId) {
    assembly.envelopeId = EnvelopeId(envelopeId);
    hasAssembly = true;
  }

  const featuresStr = row["assembly.features"] || row.features;
  if (featuresStr) {
    const features = parseArray(featuresStr);
    if (features && features.length > 0) {
      assembly.features = features as (
        | "MAILMARK"
        | "BRAILLE"
        | "AUDIO"
        | "ADMAIL"
      )[];
      hasAssembly = true;
    }
  }

  if (hasAssembly) {
    pack.assembly = assembly;
  }

  return pack;
}

/**
 * Parse LetterVariant from Excel row
 */
function parseLetterVariant(row: LetterVariantRow): LetterVariant {
  const variant: LetterVariant = {
    id: LetterVariantId(row.id),
    name: row.name,
    description: row.description || row.name,
    type: row.type as "STANDARD" | "BRAILLE" | "AUDIO" | "SAME_DAY",
    status: row.status as "DRAFT" | "PUBLISHED" | "DISABLED",
    packSpecificationIds: parseArray(row.packSpecificationIds)!.map((id) =>
      PackSpecificationId(id),
    ),
  };

  if (row.clientId) {
    variant.clientId = row.clientId;
  }

  if (row.campaignIds) {
    variant.campaignIds = parseArray(row.campaignIds);
  }

  return variant;
}

/**
 * Main function to parse Excel file and convert to domain objects
 */
export default function parseExcelFile(filePath: string): {
  packs: Record<string, PackSpecification>;
  variants: Record<string, LetterVariant>;
} {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);

  // Parse PackSpecification sheet
  const packSheet = workbook.Sheets.PackSpecification;
  if (!packSheet) {
    throw new Error("PackSpecification sheet not found in Excel file");
  }
  const packRows: PackSpecificationRow[] = XLSX.utils.sheet_to_json(packSheet);
  const packs: Record<string, PackSpecification> = {};

  for (const row of packRows) {
    const pack = parsePackSpecification(row);
    // Use a sanitized version of the ID as the key
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const key = pack.id.replace(/[^a-zA-Z0-9]/g, "");
    // eslint-disable-next-line security/detect-object-injection
    packs[key] = pack;
  }

  // Parse LetterVariant sheet
  const variantSheet = workbook.Sheets.LetterVariant;
  if (!variantSheet) {
    throw new Error("LetterVariant sheet not found in Excel file");
  }
  const variantRows: LetterVariantRow[] =
    XLSX.utils.sheet_to_json(variantSheet);
  const variants: Record<string, LetterVariant> = {};

  for (const row of variantRows) {
    const variant = parseLetterVariant(row);
    // Use a sanitized version of the ID as the key
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    const key = variant.id.replace(/[^a-zA-Z0-9]/g, "");
    // eslint-disable-next-line security/detect-object-injection
    variants[key] = variant;
  }

  return { packs, variants };
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  const inputFile =
    args[0] || path.join(__dirname, "../examples/specifications.xlsx");
  const outputFile =
    args[1] || path.join(__dirname, "../../output/specifications.json");

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(inputFile)) {
    // eslint-disable-next-line no-console
    console.error(`Error: Input file not found: ${inputFile}`);
    throw new Error(`Input file not found: ${inputFile}`);
  }

  try {
    // eslint-disable-next-line no-console
    console.log(`Parsing Excel file: ${inputFile}`);
    const result = parseExcelFile(inputFile);

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(outputDir)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the result to JSON file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    // eslint-disable-next-line no-console
    console.log(`Successfully wrote output to: ${outputFile}`);
    // eslint-disable-next-line no-console
    console.log(
      `Parsed ${Object.keys(result.packs).length} pack specifications`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `Parsed ${Object.keys(result.variants).length} letter variants`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error parsing Excel file:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
