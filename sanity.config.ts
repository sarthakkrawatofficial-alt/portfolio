"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { apiVersion, dataset, projectId } from "./src/sanity/env";

export default defineConfig({
  name: "sarthak-portfolio",
  title: "Sarthak Rawat — Portfolio",
  basePath: "/studio",
  projectId: projectId || "missing",
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem().title("Site settings").child(S.document().schemaType("settings").documentId("settings")),
            S.divider(),
            ...S.documentTypeListItems().filter((i) => i.getId() !== "settings"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
