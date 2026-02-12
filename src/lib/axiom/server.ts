import axiom from "./axiom";
import { Logger, AxiomJSTransport } from "@axiomhq/logging";
import { createAxiomRouteHandler, nextJsFormatters } from "@axiomhq/nextjs";

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom,
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!,
    }),
  ],
  formatters: nextJsFormatters,
});

export const withAxiom = createAxiomRouteHandler(logger);
