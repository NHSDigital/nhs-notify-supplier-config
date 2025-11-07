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
          "postage.id": "postage-standard",
          "postage.size": "STANDARD",
        },
        {
          id: "pack-2",
          name: "Pack 2",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.id": "postage-large",
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
    expect(result.packs.pack1.postage.id).toBe("postage-standard");
    expect(result.packs.pack1.postage.size).toBe("STANDARD");
    expect(result.packs.pack2.postage.id).toBe("postage-large");
    expect(result.packs.pack2.postage.size).toBe("LARGE");
    expect(result.variants.variant1.packSpecificationIds).toEqual([
      PackSpecificationId("pack-1"),
      PackSpecificationId("pack-2"),
    ]);
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
          "postage.id": "postage-bad",
          "postage.size": "C5", // invalid size value
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

  it("parses constraints on PackSpecification", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-with-constraints",
          name: "Pack with Constraints",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.id": "postage-1",
          "postage.size": "STANDARD",
          "constraints.maxSheets": "10",
          "constraints.deliverySLA": "5",
          "constraints.blackCoveragePercentage": "80.5",
          "constraints.colourCoveragePercentage": "50.25",
        },
      ],
      variants: [],
    });
    const file = writeWorkbook(wb);
    const result = parseExcelFile(file);
    expect(result.packs.packwithconstraints.constraints).toEqual({
      maxSheets: 10,
      deliverySLA: 5,
      blackCoveragePercentage: 80.5,
      colourCoveragePercentage: 50.25,
    });
  });

  it("parses constraints on LetterVariant", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-1",
          name: "Pack 1",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.id": "postage-1",
          "postage.size": "STANDARD",
        },
      ],
      variants: [
        {
          id: "variant-with-constraints",
          name: "Variant with Constraints",
          description: "Test variant",
          packSpecificationIds: "pack-1",
          type: "STANDARD",
          status: "PUBLISHED",
          "constraints.maxSheets": "8",
          "constraints.deliverySLA": "3",
        },
      ],
    });
    const file = writeWorkbook(wb);
    const result = parseExcelFile(file);
    expect(result.variants.variantwithconstraints.constraints).toEqual({
      maxSheets: 8,
      deliverySLA: 3,
    });
  });

  it("parses assembly with paper, insertIds, and features", () => {
    const wb = buildWorkbook({
      packs: [
        {
          id: "pack-with-assembly",
          name: "Pack with Assembly",
          status: "PUBLISHED",
          version: "1",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          "postage.id": "postage-1",
          "postage.size": "STANDARD",
          "assembly.envelopeId": "envelope-1",
          "assembly.printColour": "COLOUR",
          "assembly.paper.id": "paper-1",
          "assembly.paper.name": "Standard White",
          "assembly.paper.weightGSM": "90",
          "assembly.paper.size": "A4",
          "assembly.paper.colour": "WHITE",
          "assembly.paper.recycled": "true",
          "assembly.insertIds": "insert-1,insert-2",
          "assembly.features": "MAILMARK,BRAILLE",
        },
      ],
      variants: [],
    });
    const file = writeWorkbook(wb);
    const result = parseExcelFile(file);
    const pack = result.packs.packwithassembly;
    expect(pack.assembly?.envelopeId).toBe("envelope-1");
    expect(pack.assembly?.printColour).toBe("COLOUR");
    expect(pack.assembly?.paper?.id).toBe("paper-1");
    expect(pack.assembly?.paper?.name).toBe("Standard White");
    expect(pack.assembly?.paper?.weightGSM).toBe(90);
    expect(pack.assembly?.paper?.size).toBe("A4");
    expect(pack.assembly?.paper?.colour).toBe("WHITE");
    expect(pack.assembly?.paper?.recycled).toBe(true);
    expect(pack.assembly?.insertIds).toEqual(["insert-1", "insert-2"]);
    expect(pack.assembly?.features).toEqual(["MAILMARK", "BRAILLE"]);
  });
});
