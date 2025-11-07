import * as XLSX from "xlsx";
import { PackSpecificationId } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseExcelFile } from "../lib/parse-excel";

function buildWorkbook(data: { packs: any[]; variants: any[] }) {
  const wb = XLSX.utils.book_new();
  const packSheet = XLSX.utils.json_to_sheet(data.packs);
  const variantSheet = XLSX.utils.json_to_sheet(data.variants);
  XLSX.utils.book_append_sheet(wb, packSheet, "PackSpecification");
  XLSX.utils.book_append_sheet(wb, variantSheet, "LetterVariant");
  return wb;
}

function writeWorkbook(wb: XLSX.WorkBook): string {
  const filePath = path.join(tmpdir(), `test-${Date.now()}.xlsx`);
  XLSX.writeFile(wb, filePath);
  return filePath;
}

describe("parse-excel", () => {
  it("parses canonical enum values", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-1",
          name: "Pack 1",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.tariff": "ECONOMY",
          "postage.size": "STANDARD",
        },
        {
          id: "pack-2",
          name: "Pack 2",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.tariff": "FIRST",
          "postage.size": "LARGE",
        },
      ],
      variants: [
        {
          id: "variant-1",
          name: "Variant 1",
          description: "Variant 1",
          packSpecificationIds: "pack-1,pack-2",
          type: "STANDARD",
          status: "PUBLISHED",
        },
      ],
    });
    const file = writeWorkbook(wb);
    const result = parseExcelFile(file);
    expect(result.packs.pack1.postage.tariff).toBe("ECONOMY");
    expect(result.packs.pack1.postage.size).toBe("STANDARD");
    expect(result.packs.pack2.postage.tariff).toBe("FIRST");
    expect(result.packs.pack2.postage.size).toBe("LARGE");
    expect(result.variants.variant1.packSpecificationIds).toEqual([
      PackSpecificationId("pack-1"),
      PackSpecificationId("pack-2"),
    ]);
  });

  it("throws on invalid tariff (legacy value)", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-bad-tariff",
          name: "Bad Tariff Pack",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.tariff": "A", // legacy invalid
          "postage.size": "STANDARD",
        },
      ],
      variants: [],
    });
    const file = writeWorkbook(wb);
    expect(() => parseExcelFile(file)).toThrow(
      /Validation failed.*pack-bad-tariff/,
    );
  });

  it("throws on invalid postage size", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-bad-size",
          name: "Bad Size Pack",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.tariff": "ECONOMY",
          "postage.size": "C5", // legacy size value now invalid
        },
      ],
      variants: [],
    });
    const file = writeWorkbook(wb);
    expect(() => parseExcelFile(file)).toThrow(
      /Validation failed.*pack-bad-size/,
    );
  });

  it("throws on missing required postage fields", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-missing",
          name: "Missing Pack",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          // missing postage fields entirely
        },
      ],
      variants: [],
    });
    const file = writeWorkbook(wb);
    expect(() => parseExcelFile(file)).toThrow(
      /Missing required postage fields/,
    );
  });
});
