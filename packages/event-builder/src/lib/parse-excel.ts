import * as XLSX from "xlsx";
import {
  $PackSpecification,
  EnvelopeId,
  PackSpecification,
  PackSpecificationId,
} from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import {
  $LetterVariant,
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
  billingId?: string;
  envelopeId?: string;
  features?: string;
  "assembly.envelopeId"?: string;
  "assembly.features"?: string;
  "postage.tariff"?: string;
  "postage.size"?: string;
  "postage.maxSheets"?: string;
  "postage.deliverySLA"?: string;
  "postage.maxWeight"?: string;
  "postage.maxThickness"?: string;
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

function parseDate(dateStr?: string): string {
  if (!dateStr) return "2023-01-01T00:00:00Z";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? "2023-01-01T00:00:00Z"
    : date.toISOString();
}

function parseArray(value?: string): string[] | undefined {
  if (!value || value.trim() === "") return undefined;
  return value.split(",").map((item) => item.trim());
}

function parsePostage(
  row: PackSpecificationRow,
): PackSpecification["postage"] | undefined {
  if (!(row["postage.tariff"] && row["postage.size"])) return undefined;
  const postage: PackSpecification["postage"] = {
    tariff: row["postage.tariff"],
    size: row["postage.size"],
  };
  if (row["postage.maxSheets"])
    postage.maxSheets = Number.parseInt(row["postage.maxSheets"], 10);
  if (row["postage.deliverySLA"])
    postage.deliverySLA = Number.parseInt(row["postage.deliverySLA"], 10);
  if (row["postage.maxWeight"])
    postage.maxWeight = Number.parseFloat(row["postage.maxWeight"]);
  if (row["postage.maxThickness"])
    postage.maxThickness = Number.parseFloat(row["postage.maxThickness"]);
  return postage;
}

function parseAssembly(
  row: PackSpecificationRow,
): NonNullable<PackSpecification["assembly"]> | undefined {
  const assembly: NonNullable<PackSpecification["assembly"]> = {};
  let has = false;
  const envelopeId = row["assembly.envelopeId"] || row.envelopeId;
  if (envelopeId) {
    assembly.envelopeId = EnvelopeId(envelopeId);
    has = true;
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
      has = true;
    }
  }
  return has ? assembly : undefined;
}

function parsePackSpecification(row: PackSpecificationRow): PackSpecification {
  const pack: Partial<PackSpecification> = {
    id: PackSpecificationId(row.id),
    name: row.name,
    status: row.status as "DRAFT" | "PUBLISHED" | "DISABLED",
    version: Number.parseInt(row.version, 10),
    createdAt: parseDate(row.createdAt),
    updatedAt: parseDate(row.updatedAt),
  };
  if (row.billingId) pack.billingId = row.billingId;
  const postage = parsePostage(row);
  if (postage) pack.postage = postage;
  const assembly = parseAssembly(row);
  if (assembly) pack.assembly = assembly;
  try {
    return $PackSpecification.parse(pack);
  } catch (error) {
    throw new Error(
      `Validation failed for PackSpecification with id "${row.id}": ${error}`,
    );
  }
}

function parseLetterVariant(row: LetterVariantRow): LetterVariant {
  const baseIds = parseArray(row.packSpecificationIds) ?? [];
  const variant: LetterVariant = {
    id: LetterVariantId(row.id),
    name: row.name,
    description: row.description || row.name,
    type: row.type as "STANDARD" | "BRAILLE" | "AUDIO" | "SAME_DAY",
    status: row.status as "DRAFT" | "PUBLISHED" | "DISABLED",
    packSpecificationIds: baseIds.map((id) => PackSpecificationId(id)),
  };
  if (row.clientId) variant.clientId = row.clientId;
  if (row.campaignIds) variant.campaignIds = parseArray(row.campaignIds);
  try {
    return $LetterVariant.parse(variant);
  } catch (error) {
    throw new Error(
      `Validation failed for LetterVariant with id "${row.id}": ${error}`,
    );
  }
}

export interface ParseResult {
  packs: Record<string, PackSpecification>;
  variants: Record<string, LetterVariant>;
}

function sanitizeId(id: string): string {
  return id.replaceAll(/[^a-zA-Z0-9]/g, "");
}

function buildPacks(
  packRows: PackSpecificationRow[],
): Record<string, PackSpecification> {
  const packs: Record<string, PackSpecification> = {};
  for (const row of packRows) {
    const pack = parsePackSpecification(row);
    const key = sanitizeId(pack.id);
    Object.defineProperty(packs, key, { value: pack, enumerable: true });
  }
  return packs;
}

function buildVariants(
  variantRows: LetterVariantRow[],
): Record<string, LetterVariant> {
  const variants: Record<string, LetterVariant> = {};
  for (const row of variantRows) {
    const variant = parseLetterVariant(row);
    const key = sanitizeId(variant.id);
    Object.defineProperty(variants, key, { value: variant, enumerable: true });
  }
  return variants;
}

export function parseExcelFile(filePath: string): ParseResult {
  const workbook = XLSX.readFile(filePath);

  const packSheet = workbook.Sheets.PackSpecification;
  if (!packSheet)
    throw new Error("PackSpecification sheet not found in Excel file");
  const packRows: PackSpecificationRow[] = XLSX.utils.sheet_to_json(packSheet);
  const packs = buildPacks(packRows);

  const variantSheet = workbook.Sheets.LetterVariant;
  if (!variantSheet)
    throw new Error("LetterVariant sheet not found in Excel file");
  const variantRows: LetterVariantRow[] =
    XLSX.utils.sheet_to_json(variantSheet);
  const variants = buildVariants(variantRows);

  return { packs, variants };
}
