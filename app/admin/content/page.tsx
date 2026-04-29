import { getSiteConfig } from "@/lib/siteConfig";
import ContentEditor from "@/components/ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentEditorPage() {
  const config = await getSiteConfig();
  return (
    <div>
      <h2 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>Content Editor</h2>
      <p className="text-muted mb-4">Edit your site banner, header, homepage sections, and footer.</p>
      <ContentEditor initialConfig={config} />
    </div>
  );
}
