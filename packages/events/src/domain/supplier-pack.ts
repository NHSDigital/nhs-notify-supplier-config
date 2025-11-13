import { z } from "zod";
import { idRef } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/helpers/id-ref";
import { $ChannelSupplier } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/channel-supplier";
import { $PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { ConfigBase } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";

export const $SupplierPack = ConfigBase("SupplierPack")
  .extend({
    packSpecificationId: idRef($PackSpecification),
    supplierId: idRef($ChannelSupplier),
    status: z.enum(["SUBMITTED", "APPROVED", "REJECTED", "DEPRECATED"]).meta({
      title: "SupplierPackStatus",
      description:
        "Indicates the current state of the supplier pack approval process.",
    }),
  })
  .meta({
    title: "SupplierPack",
    description:
      "Indicates that a specific supplier is capable of producing a specific pack specification.",
  });

export type SupplierPack = z.infer<typeof $SupplierPack>;
