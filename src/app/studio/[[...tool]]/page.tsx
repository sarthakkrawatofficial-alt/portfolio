import { isSanityConfigured } from "@/sanity/env";
import Studio from "./Studio";

export const dynamic = "force-static";
export const generateStaticParams = () => [{ tool: [] as string[] }];
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="min-h-screen grid place-items-center px-6 py-24">
        <div className="max-w-xl rounded-3xl border border-line bg-card p-8 md:p-10">
          <p className="label text-lime">/studio · Sanity CMS</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Connect your Sanity project</h1>
          <ol className="mt-6 space-y-3 text-muted list-decimal pl-5">
            <li>Create a free project at sanity.io/manage and copy its Project ID.</li>
            <li>
              Add <code className="text-fg">NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and optionally{" "}
              <code className="text-fg">NEXT_PUBLIC_SANITY_DATASET</code>) to <code className="text-fg">.env.local</code> and to your Vercel
              project settings.
            </li>
            <li>In sanity.io/manage → API → CORS origins, add your local and Vercel URLs (allow credentials).</li>
            <li>
              Optional: run <code className="text-fg">npm run seed</code> with a <code className="text-fg">SANITY_WRITE_TOKEN</code> to import
              all current portfolio content.
            </li>
          </ol>
          <p className="mt-6 text-sm text-muted">Until then, the site renders its built-in content.</p>
        </div>
      </main>
    );
  }
  return <Studio />;
}
