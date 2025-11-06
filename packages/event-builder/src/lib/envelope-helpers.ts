import { randomUUID } from "node:crypto";

export type SeverityText =
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "FATAL";

export const severityNumber = (severity: SeverityText): number => {
  switch (severity) {
    case "TRACE": {
      return 0;
    }
    case "DEBUG": {
      return 1;
    }
    case "INFO": {
      return 2;
    }
    case "WARN": {
      return 3;
    }
    case "ERROR": {
      return 4;
    }
    case "FATAL": {
      return 5;
    }
    default: {
      return 2;
    } // INFO fallback
  }
};

export const generateTraceParent = (): string => {
  const traceId = randomUUID().replaceAll("-", ""); // 32 hex
  const spanId = randomUUID().replaceAll("-", "").slice(0, 16); // 16 hex
  return `00-${traceId}-${spanId}-01`;
};

export const nextSequence = (counter: number): string =>
  counter.toString().padStart(20, "0");
