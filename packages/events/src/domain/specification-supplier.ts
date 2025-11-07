import { z } from "zod";
import { idRef } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/helpers/id-ref";
import { $ChannelSupplier } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/channel-supplier";
import { $PackSpecification } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/pack-specification";
import { ConfigBase } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";

export const $SpecificationSupplier = ConfigBase("SpecificationSupplier")
  .extend({
    packSpecificationId: idRef($PackSpecification),
    supplierId: idRef($ChannelSupplier),
  })
  .describe("SpecificationSupplier");

export type SpecificationSupplier = z.infer<typeof $SpecificationSupplier>;
