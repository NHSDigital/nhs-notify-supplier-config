import { z } from "zod";
import { idRef } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/helpers/id-ref";
import { $PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { ConfigBase } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";
import { $Supplier } from "./supplier";

export const $SupplierPack = ConfigBase("SupplierPack")
  .extend({
    packSpecificationId: idRef($PackSpecification),
    supplierId: idRef($Supplier),
    status: z.enum(["SUBMITTED", "APPROVED", "REJECTED", "DISABLED"]).meta({
      title: "SupplierPackStatus",
      description:
        "Indicates the current state of the supplier pack approval process.",
    }),
  })
  .meta({
    title: "SupplierPack",
    description:
      "Indicates that a supplier is capable of producing a specific pack specification.",
  });

export type SupplierPack = z.infer<typeof $SupplierPack>;
