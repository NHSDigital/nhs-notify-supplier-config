import { z } from "zod";
import idRef from "@nhsdigital/nhs-notify-schemas-supplier-config/src/helpers/id-ref";
import { $ChannelSupplier } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/channel-supplier";
import { $Specification } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/specification";
import { ConfigBase } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";

export const $SpecificationSupplier = ConfigBase("SpecificationSupplier")
  .extend({
    specificationId: idRef($Specification),
    supplierId: idRef($ChannelSupplier),
  })
  .describe("SpecificationSupplier");

export type SpecificationSupplier = z.infer<typeof $SpecificationSupplier>;
