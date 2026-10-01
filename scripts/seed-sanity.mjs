// Imports the built-in portfolio content into Sanity.
// Usage: NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=yyy npm run seed
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { fallbackContent: c } = await jiti.import("../src/content/site.ts");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: "2025-01-01",
  useCdn: false,
});

const tx = client.transaction();
tx.createOrReplace({ _id: "settings", _type: "settings", ...c.settings, stats: c.stats.map((s, i) => ({ _key: `s${i}`, ...s })), clients: c.clients, tools: c.tools });
c.projects.forEach((p, i) => {
  const { id, ...rest } = p;
  tx.createOrReplace({ _id: `project-${id}`, _type: "project", ...rest, order: i });
});
for (const [i, t] of c.testimonials.entries()) {
  let avatar;
  if (t.avatar) {
    const file = await readFile(join(process.cwd(), "public", t.avatar));
    const asset = await client.assets.upload("image", file, { filename: basename(t.avatar) });
    avatar = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  }
  tx.createOrReplace({ _id: `testimonial-${i}`, _type: "testimonial", ...t, avatar, order: i });
}
c.faqs.forEach((f, i) => tx.createOrReplace({ _id: `faq-${i}`, _type: "faq", ...f, order: i }));
c.journey.forEach((j, i) => tx.createOrReplace({ _id: `job-${i}`, _type: "job", ...j, order: i }));
await tx.commit();
console.log("Seeded Sanity with portfolio content.");
