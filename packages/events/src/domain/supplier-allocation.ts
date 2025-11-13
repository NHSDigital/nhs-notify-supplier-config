import { z } from "zod";
import { ConfigBase } from "./common";
import { idRef } from "../helpers/id-ref";
import { $Contract } from "./contract";
import { $ChannelSupplier } from "./channel-supplier";

export const $SupplierAllocation = ConfigBase("SupplierAllocation")
  .extend({
    contract: idRef($Contract),
    supplier: idRef($ChannelSupplier),
    allocationPercentage: z.number().min(0).max(100),
    status: z.enum(["PUBLISHED", "REMOVED"]),
  })
  .meta({
    title: "SupplierAllocation",
    description:
      "A SupplierAllocation defines the proportion of the volume associated with a contract which should be processed using a specific supplier.",
  });
export type SupplierAllocation = z.infer<typeof $SupplierAllocation>;
