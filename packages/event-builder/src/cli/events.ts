#!/usr/bin/env ts-node
import path from "node:path";
import fs from "node:fs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { parseExcelFile } from "event-builder/src/lib/parse-excel";
import { buildLetterVariantEvents } from "event-builder/src/letter-variant-event-builder";

interface CommonArgs {
  file: string;
}
interface PublishArgs extends CommonArgs {
  bus: string;
  region?: string;
  dryRun?: boolean;
}

function ensureFile(file: string): string {
  const resolved = path.isAbsolute(file)
    ? file
    : path.join(process.cwd(), file || "specifications.xlsx");
  // Use statSync with try/catch to satisfy security lint (literal path already constructed)
  try {
    fs.statSync(resolved);
  } catch {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return resolved;
}

async function handleParse(args: CommonArgs): Promise<void> {
  const inputFile = ensureFile(args.file);
  console.log(`Parsing Excel file: ${inputFile}`);
  const result = parseExcelFile(inputFile);
  console.log(JSON.stringify(result, null, 2));
  console.log(`Parsed ${Object.keys(result.packs).length} pack specifications`);
  console.log(`Parsed ${Object.keys(result.variants).length} letter variants`);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function handlePublish(args: PublishArgs): Promise<void> {
  const inputFile = ensureFile(args.file);
  console.log(`Reading variants from: ${inputFile}`);
  const { variants } = parseExcelFile(inputFile);
  const events = buildLetterVariantEvents(variants);
  console.log(`Built ${events.length} LetterVariant events (non-draft only)`);

  if (args.dryRun) {
    console.log(
      "--dry-run specified; events will NOT be sent. Showing first event:",
    );
    if (events[0]) console.log(JSON.stringify(events[0], null, 2));
    return;
  }

  const region =
    args.region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!region)
    throw new Error("AWS region not specified (flag or AWS_REGION env)");

  const client = new EventBridgeClient({ region });
  let sent = 0;
  for (const batch of chunk(events, 10)) {
    const Entries = batch.map((e) => ({
      DetailType: e.type,
      Source: e.source,
      EventBusName: args.bus,
      Time: new Date(e.time),
      Detail: JSON.stringify(e.data),
      Resources: [e.subject],
    }));
    try {
      const resp = await client.send(new PutEventsCommand({ Entries }));
      if (resp.FailedEntryCount && resp.FailedEntryCount > 0) {
        console.error(`PutEvents had ${resp.FailedEntryCount} failed entries`);
        console.error(JSON.stringify(resp, null, 2));
        process.exitCode = 1;
        return;
      }
      sent += Entries.length;
    } catch (error) {
      console.error("Error sending events batch", error);
      process.exitCode = 1;
      return;
    }
  }
  console.log(`Successfully published ${sent} events to bus ${args.bus}`);
}

async function main(): Promise<void> {
  const parser = yargs(hideBin(process.argv))
    .scriptName("events")
    .demandCommand(1, "Specify a command")
    .strict()
    .recommendCommands()
    .version(false)
    .help()
    .command<CommonArgs>(
      "parse",
      "Parse excel and output JSON to stdout",
      (cmd) =>
        cmd.option("file", {
          alias: "f",
          describe: "Excel file path",
          type: "string",
          default: "specifications.xlsx",
        }),
      async (argv) => {
        await handleParse({ file: argv.file });
      },
    )
    .command<PublishArgs>(
      "publish",
      "Publish LetterVariant events to EventBridge",
      (cmd) =>
        cmd
          .option("file", {
            alias: "f",
            describe: "Excel file path",
            type: "string",
            default: "specifications.xlsx",
          })
          .option("bus", {
            alias: "b",
            type: "string",
            describe: "EventBridge event bus name",
            demandOption: true,
          })
          .option("region", {
            alias: "r",
            type: "string",
            describe: "AWS region (fallback AWS_REGION env)",
          })
          .option("dry-run", {
            type: "boolean",
            describe: "Build events but do not send",
            default: false,
          }),
      async (argv) => {
        await handlePublish(argv);
      },
    )
    .example("$0 parse -f specs.xlsx", "Parse a spreadsheet and print JSON")
    .example(
      "$0 publish -f specs.xlsx -b my-bus -r eu-west-2",
      "Publish events to EventBridge",
    );

  try {
    await parser.parseAsync();
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
