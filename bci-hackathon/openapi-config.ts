import type { ConfigFile } from "@rtk-query/codegen-openapi";

export const config: ConfigFile = {
  schemaFile: "http://localhost:8000/openapi.json",
  apiFile: "./src/store/api.ts",
  apiImport: "emptySplitApi",
  outputFile: "./src/store/endpoints.ts",
  exportName: "enhancedApi",
  hooks: true, // dodaj to, żeby automatycznie generować hooki
};
