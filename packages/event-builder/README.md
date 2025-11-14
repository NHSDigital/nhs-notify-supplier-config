# Event Builder CLI

Provides utilities for parsing supplier configuration spreadsheets and publishing LetterVariant events to AWS EventBridge.

## Installation

From repository root:

```bash
npm install
```

## Usage

Run via package script:

```bash
npm run cli:events -- <command> [options]
```

Or directly with ts-node:

```bash
npx ts-node packages/event-builder/src/cli/events.ts <command> [options]
```

### Commands

- `parse`  Parse the Excel file and emit JSON to stdout.
- `publish` Build and publish specialised LetterVariant events (non-draft) to an EventBridge event bus.

### Options

| Option | Description |
| ------ | ----------- |
| `-f, --file <path>` | Input Excel file (default `./specifications.xlsx`) |
| `-b, --bus <name>` | EventBridge event bus name (required for publish) |
| `-r, --region <aws-region>` | AWS region (defaults to `AWS_REGION` env) |
| `--dry-run` | Build events but do not send; prints first event |

### Event Envelope Defaults

- `source`: `/control-plane/supplier-config/<env>/<service>` (config via `EVENT_ENV`, `EVENT_SERVICE`, defaults `dev`/`events`)
- `severitytext`: `INFO` / `severitynumber`: `2`
- `partitionkey`: `LetterVariant.id`
- `sequence`: Incrementing zero-padded 20-digit counter per run
- `traceparent`: Randomly generated W3C trace context value
- `dataschema` & `dataschemaversion`: Fixed to example version `1.0.0`

### Dry Run

Use `--dry-run` to validate event construction without calling AWS.

### AWS Credentials

Standard AWS SDK resolution chain (env vars, shared config/credentials files, SSO, etc.). Ensure the configured principal has `events:PutEvents` on the target bus.

### Exit Codes

- `0` success
- `1` validation or publish failure

## Tests

Run unit tests:

```bash
npm test --workspace=nhs-notify-supplier-config-event-builder
```

## Future Enhancements

- Add PackSpecification events
- Retry logic for partial failures
- Additional envelope metadata (sampling, classification)
