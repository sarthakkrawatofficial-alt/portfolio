import "server-only";
import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";
import { fallbackContent, type SiteContent } from "@/content/site";

const QUERY = `{
  "settings": *[_type == "settings"][0],
  "projects": *[_type == "project"] | order(order asc) { "id": _id, title, client, platform, role, category, youtubeId, orientation, description },
  "testimonials": *[_type == "testimonial"] | order(order asc) { name, company, quote, highlight, isLogo, avatar },
  "faqs": *[_type == "faq"] | order(order asc) { question, answer },
  "journey": *[_type == "job"] | order(order asc) { period, place, role, company, note, current }
}`;

/** Loads content from Sanity when configured, filling any gaps from the built-in content. */
export async function getContent(): Promise<SiteContent> {
  if (!isSanityConfigured) return fallbackContent;
  try {
    const client = createClient({ projectId, dataset, apiVersion, useCdn: true });
    const img = createImageUrlBuilder({ projectId, dataset });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = await client.fetch(QUERY, {}, { next: { revalidate: 60 } });
    const fb = fallbackContent;
    const s = d?.settings ?? {};
    const pick = <T,>(arr: T[] | undefined, def: T[]) => (arr && arr.length ? arr : def);
    return {
      settings: { ...fb.settings, ...Object.fromEntries(Object.entries(s).filter(([k, v]) => v != null && !k.startsWith("_") && k in fb.settings)) },
      stats: pick(s.stats, fb.stats),
      clients: pick(s.clients, fb.clients),
      tools: pick(s.tools, fb.tools),
      projects: pick(d?.projects, fb.projects),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testimonials: pick(d?.testimonials?.map((t: any) => ({ ...t, avatar: t.avatar ? img.image(t.avatar).width(160).url() : undefined })), fb.testimonials),
      faqs: pick(d?.faqs, fb.faqs),
      journey: pick(d?.journey, fb.journey),
    };
  } catch (e) {
    console.warn("[sanity] falling back to built-in content:", (e as Error).message);
    return fallbackContent;
  }
}
