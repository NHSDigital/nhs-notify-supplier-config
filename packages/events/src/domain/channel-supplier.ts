import { z } from "zod";
import { $ChannelType } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/channel";
import { ConfigBase } from "@nhsdigital/nhs-notify-schemas-supplier-config/src/domain/common";

export const $ChannelSupplier = ConfigBase("ChannelSupplier")
  .extend({
    channelType: $ChannelType,
    outputQueue: z.string(),
  })
  .describe("ChannelSupplier");

export type ChannelSupplier = z.infer<typeof $ChannelSupplier>;
