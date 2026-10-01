import { defineArrayMember, defineField, defineType } from "sanity";

const CATEGORIES = ["SaaS & Product", "Short-form", "Trailer & Promo", "Documentary"];

export const settings = defineType({
  name: "settings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "currentCompany", type: "string" }),
    defineField({ name: "yearsExperience", type: "number" }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "phone", type: "string", description: "Displayed, e.g. +91 95987 23609" }),
    defineField({ name: "phoneHref", type: "string", description: "e.g. tel:+919598723609" }),
    defineField({ name: "instagram", type: "url" }),
    defineField({ name: "instagramHandle", type: "string" }),
    defineField({ name: "showreelId", title: "Showreel YouTube ID", type: "string" }),
    defineField({ name: "available", title: "Available for work", type: "boolean", initialValue: true }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", type: "number" }),
            defineField({ name: "suffix", type: "string" }),
            defineField({ name: "label", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "clients", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "tools", type: "array", of: [defineArrayMember({ type: "string" })] }),
  ],
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [{ title: "Manual order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "client", type: "string" }),
    defineField({ name: "platform", type: "string", description: "YouTube, Reels / Shorts, LinkedIn…" }),
    defineField({ name: "role", type: "string", description: "What you did, e.g. Motion design · Edit" }),
    defineField({ name: "category", type: "string", options: { list: CATEGORIES } }),
    defineField({ name: "youtubeId", title: "YouTube video ID", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "orientation",
      type: "string",
      options: { list: ["landscape", "portrait"], layout: "radio" },
      initialValue: "landscape",
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "client" } },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "quote", type: "text", rows: 4 }),
    defineField({ name: "highlight", type: "string", description: "Exact phrase from the quote to highlight" }),
    defineField({ name: "avatar", type: "image" }),
    defineField({ name: "isLogo", type: "boolean", description: "Avatar is a company logo" }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string" }),
    defineField({ name: "answer", type: "text", rows: 4 }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const job = defineType({
  name: "job",
  title: "Journey / job",
  type: "document",
  fields: [
    defineField({ name: "period", type: "string" }),
    defineField({ name: "place", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "note", type: "text", rows: 2 }),
    defineField({ name: "current", type: "boolean" }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const schemaTypes = [settings, project, testimonial, faq, job];
