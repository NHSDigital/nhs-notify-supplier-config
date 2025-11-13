import { z } from "zod";
import { $ChannelType } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/channel";
import { ConfigBase } from "@nhsdigital/nhs-notify-event-schemas-supplier-config/src/domain/common";

export const $ChannelSupplier = ConfigBase("ChannelSupplier")
  .extend({
    name: z.string(),
    channelType: $ChannelType,
  })
  .describe("ChannelSupplier");

export type ChannelSupplier = z.infer<typeof $ChannelSupplier>;
