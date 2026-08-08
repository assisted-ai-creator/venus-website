"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, type AdminUser } from "@/components/admin/api";
import { Button, Card, Empty, useToast } from "@/components/admin/ui";

interface Overview {
  user: AdminUser;
  counts: {
    pages: number;
    sections: number;
    albums: number;
    photos: number;
    posts: number;
    drafts: number;
    notices: number;
    openEnquiries: number;
  };
  snapshotVersion: number;
}

interface Activity {
  user: string;
  action: string;
  entity: string;
  detail: string;
  at: number;
}

const ACTION_WORDS: Record<string, string> = {
  "page.create": "added a page",
  "page.update": "edited a page",
  "page.delete": "deleted a page",
  "section.create": "added a section",
  "section.update": "edited a section",
  "section.delete": "removed a section",
  "section.move": "moved a section",
  "album.create": "created an album",
  "album.update": "edited an album",
  "album.delete": "deleted an album",
  "media.upload": "uploaded",
  "media.delete": "deleted a file",
  "post.create": "wrote a post",
  "post.update": "edited a post",
  "post.delete": "deleted a post",
  "notice.create": "posted a notice",
  "notice.update": "edited a notice",
  "notice.delete": "removed a notice",
  "settings.update": "changed settings",
  "settings.security.update": "changed who may reach the panel",
  "auth.login": "signed in",
  "auth.login.failed": "failed to sign in",
  "enquiry.handled": "marked an enquiry handled",
};

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <span className="display tabular block text-[clamp(1.8rem,4vw,2.6rem)] text-paper">{value}</span>
      <span className="chart-label mt-1 block text-navy-300">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="adm-card block p-4 transition-transform hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    <div className="adm-card p-4">{inner}</div>
  );
}

export default function AdminHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [republishing, setRepublishing] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    api.get<Overview>("/overview").then(setData).catch(() => {});
    api
      .get<{ activity: Activity[] }>("/users/activity/recent")
      .then((r) => setActivity(r.activity))
      .catch(() => {
        // Editors cannot read the activity log; the rest of the screen still works.
      });
  }, []);

  const republish = async () => {
    setRepublishing(true);
    try {
      await api.post("/republish");
      notify("The site has been rebuilt from the current content.");
      const fresh = await api.get<Overview>("/overview");
      setData(fresh);
    } catch {
      notify("Could not rebuild the site.", "error");
    } finally {
      setRepublishing(false);
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Overview"
        description="Everything you change here is live on the website as soon as it saves — there is no publish step and no waiting."
        actions={
          <>
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn">
              Open the website
            </a>
            <Button onClick={republish} disabled={republishing}>
              {republishing ? "Rebuilding…" : "Rebuild site"}
            </Button>
          </>
        }
      />

      {!data ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pages" value={data.counts.pages} href="/admin/pages" />
            <Stat label="Sections" value={data.counts.sections} href="/admin/pages" />
            <Stat label="Albums" value={data.counts.albums} href="/admin/albums" />
            <Stat label="Photographs" value={data.counts.photos} href="/admin/media" />
            <Stat label="Notices" value={data.counts.notices} href="/admin/notices" />
            <Stat label="Published posts" value={data.counts.posts} href="/admin/blog" />
            <Stat label="Drafts" value={data.counts.drafts} href="/admin/blog" />
            <Stat label="New enquiries" value={data.counts.openEnquiries} href="/admin/enquiries" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card title="Where to start">
              <ul className="space-y-3 text-sm text-navy-100">
                <li>
                  <Link href="/admin/pages" className="font-semibold text-saffron underline">
                    Pages &amp; sections
                  </Link>{" "}
                  — every block on every page. Drag to reorder, switch a block off, move it to a
                  different page, or add a new one.
                </li>
                <li>
                  <Link href="/admin/notices" className="font-semibold text-saffron underline">
                    Notices
                  </Link>{" "}
                  — the notice board. Write one and it is on the home page and the Notices page
                  immediately; attach a circular, or set a date for it to come down by itself.
                </li>
                <li>
                  <Link href="/admin/media" className="font-semibold text-saffron underline">
                    Photographs
                  </Link>{" "}
                  — upload once, then use the same photograph in an album, a page or a post.
                </li>
                <li>
                  <Link href="/admin/blog" className="font-semibold text-saffron underline">
                    Blog
                  </Link>{" "}
                  — headings, bold, italics, lists, photographs and YouTube films, anywhere in the
                  article.
                </li>
                <li>
                  <Link href="/admin/settings" className="font-semibold text-saffron underline">
                    School details
                  </Link>{" "}
                  — the address, the telephone numbers and the CBSE figures, used across the whole
                  site at once.
                </li>
              </ul>
            </Card>

            <Card title="Recent activity">
              {activity.length === 0 ? (
                <Empty>No activity recorded yet.</Empty>
              ) : (
                <ul className="space-y-2 text-sm">
                  {activity.slice(0, 12).map((a, i) => (
                    <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-navy-200">
                      <span className="text-paper">{a.user || "Someone"}</span>
                      <span>{ACTION_WORDS[a.action] ?? a.action}</span>
                      {a.detail ? <span className="text-navy-300">· {a.detail}</span> : null}
                      <time className="chart-label tabular ml-auto text-navy-300">
                        {new Date(a.at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
