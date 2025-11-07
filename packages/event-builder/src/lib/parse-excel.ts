import * as XLSX from "xlsx";
import {
  $PackSpecification,
  EnvelopeId,
  InsertId,
  PackSpecification,
  PackSpecificationId,
  PaperId,
  PostageId,
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
  // Constraints
  "constraints.maxSheets"?: string;
  "constraints.deliverySLA"?: string;
  "constraints.blackCoveragePercentage"?: string;
  "constraints.colourCoveragePercentage"?: string;
  // Postage (only id and size are required, plus optional fields)
  "postage.id": string;
  "postage.size": string;
  "postage.deliverySLA"?: string;
  "postage.maxWeight"?: string;
  "postage.maxThickness"?: string;
  // Assembly
  "assembly.envelopeId"?: string;
  "assembly.printColour"?: string;
  "assembly.paper.id"?: string;
  "assembly.paper.name"?: string;
  "assembly.paper.weightGSM"?: string;
  "assembly.paper.size"?: string;
  "assembly.paper.colour"?: string;
  "assembly.paper.recycled"?: string;
  "assembly.insertIds"?: string;
  "assembly.features"?: string;
  "assembly.additional"?: string;
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
  // Constraints
  "constraints.maxSheets"?: string;
  "constraints.deliverySLA"?: string;
  "constraints.blackCoveragePercentage"?: string;
  "constraints.colourCoveragePercentage"?: string;
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

function parseConstraints(row: {
  "constraints.maxSheets"?: string;
  "constraints.deliverySLA"?: string;
  "constraints.blackCoveragePercentage"?: string;
  "constraints.colourCoveragePercentage"?: string;
}): PackSpecification["constraints"] | undefined {
  const constraints: NonNullable<PackSpecification["constraints"]> = {};
  let hasConstraints = false;

  if (row["constraints.maxSheets"]) {
    constraints.maxSheets = Number.parseInt(row["constraints.maxSheets"], 10);
    hasConstraints = true;
  }
  if (row["constraints.deliverySLA"]) {
    constraints.deliverySLA = Number.parseInt(
      row["constraints.deliverySLA"],
      10,
    );
    hasConstraints = true;
  }
  if (row["constraints.blackCoveragePercentage"]) {
    constraints.blackCoveragePercentage = Number.parseFloat(
      row["constraints.blackCoveragePercentage"],
    );
    hasConstraints = true;
  }
  if (row["constraints.colourCoveragePercentage"]) {
    constraints.colourCoveragePercentage = Number.parseFloat(
      row["constraints.colourCoveragePercentage"],
    );
    hasConstraints = true;
  }

  return hasConstraints ? constraints : undefined;
}

function parsePostage(row: PackSpecificationRow): PackSpecification["postage"] {
  if (!row["postage.id"] || !row["postage.size"]) {
    throw new Error(
      `Missing required postage fields (postage.id & postage.size) for PackSpecification id '${row.id}'`,
    );
  }

  const postage: PackSpecification["postage"] = {
    id: PostageId(row["postage.id"]),
    size: row["postage.size"] as PackSpecification["postage"]["size"],
  };

  if (row["postage.deliverySLA"]) {
    postage.deliverySLA = Number.parseInt(row["postage.deliverySLA"], 10);
  }
  if (row["postage.maxWeight"]) {
    postage.maxWeight = Number.parseFloat(row["postage.maxWeight"]);
  }
  if (row["postage.maxThickness"]) {
    postage.maxThickness = Number.parseFloat(row["postage.maxThickness"]);
  }

  return postage;
}

function parseAssembly(
  row: PackSpecificationRow,
): NonNullable<PackSpecification["assembly"]> | undefined {
  const assembly: NonNullable<PackSpecification["assembly"]> = {};
  let hasAssembly = false;

  if (row["assembly.envelopeId"]) {
    assembly.envelopeId = EnvelopeId(row["assembly.envelopeId"]);
    hasAssembly = true;
  }

  if (row["assembly.printColour"]) {
    assembly.printColour = row["assembly.printColour"] as "BLACK" | "COLOUR";
    hasAssembly = true;
  }

  // Parse paper if any paper fields are present
  if (row["assembly.paper.id"]) {
    assembly.paper = {
      id: PaperId(row["assembly.paper.id"]),
      name: row["assembly.paper.name"] || "",
      weightGSM: Number.parseFloat(row["assembly.paper.weightGSM"] || "80"),
      size: row["assembly.paper.size"] as "A4" | "A3",
      colour: row["assembly.paper.colour"] as "WHITE" | "COLOURED",
      recycled:
        row["assembly.paper.recycled"] === "true" ||
        row["assembly.paper.recycled"] === "TRUE",
    };
    hasAssembly = true;
  }

  if (row["assembly.insertIds"]) {
    const insertIds = parseArray(row["assembly.insertIds"]);
    if (insertIds && insertIds.length > 0) {
      assembly.insertIds = insertIds as InsertId[];
      hasAssembly = true;
    }
  }

  if (row["assembly.features"]) {
    const features = parseArray(row["assembly.features"]);
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

  if (row["assembly.additional"]) {
    try {
      assembly.additional = JSON.parse(row["assembly.additional"]);
      hasAssembly = true;
    } catch {
      // If not valid JSON, ignore it
    }
  }

  return hasAssembly ? assembly : undefined;
}

function parsePackSpecification(row: PackSpecificationRow): PackSpecification {
  const draft: Partial<PackSpecification> = {
    id: PackSpecificationId(row.id),
    name: row.name,
    status: row.status as PackSpecification["status"],
    version: Number.parseInt(row.version, 10),
    createdAt: parseDate(row.createdAt),
    updatedAt: parseDate(row.updatedAt),
    postage: parsePostage(row),
  };

  if (row.billingId) draft.billingId = row.billingId;

  const constraints = parseConstraints(row);
  if (constraints) draft.constraints = constraints;

  const assembly = parseAssembly(row);
  if (assembly) draft.assembly = assembly;

  const parsed = $PackSpecification.safeParse(draft);
  if (!parsed.success) {
    throw new Error(
      `Validation failed for PackSpecification '${row.id}': ${JSON.stringify(
        parsed.error.issues,
      )}`,
    );
  }
  return parsed.data;
}

function parseLetterVariant(row: LetterVariantRow): LetterVariant {
  const baseIds = parseArray(row.packSpecificationIds) ?? [];
  const draft: Partial<LetterVariant> = {
    id: LetterVariantId(row.id),
    name: row.name,
    description: row.description || row.name,
    type: row.type as LetterVariant["type"],
    status: row.status as LetterVariant["status"],
    packSpecificationIds: baseIds.map((id) => PackSpecificationId(id)),
  };

  if (row.clientId) draft.clientId = row.clientId;
  if (row.campaignIds) draft.campaignIds = parseArray(row.campaignIds);

  const constraints = parseConstraints(row);
  if (constraints) draft.constraints = constraints;

  const parsed = $LetterVariant.safeParse(draft);
  if (!parsed.success) {
    throw new Error(
      `Validation failed for LetterVariant '${row.id}': ${JSON.stringify(
        parsed.error.issues,
      )}`,
    );
  }
  return parsed.data;
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
