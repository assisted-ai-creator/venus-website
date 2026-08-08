"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminPage } from "@/components/admin/api";
import {
  Button,
  Card,
  ConfirmButton,
  Dialog,
  MoveButtons,
  Sortable,
  TextInput,
  useToast,
} from "@/components/admin/ui";

export default function PagesScreen() {
  const router = useRouter();
  const { notify } = useToast();
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ pages: AdminPage[] }>("/pages");
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reorder = async (ids: string[]) => {
    const byId = new Map(pages.map((p) => [p.id, p]));
    setPages(ids.map((id) => byId.get(id)).filter((p): p is AdminPage => !!p));
    try {
      await api.post("/pages/reorder", { ids });
    } catch {
      notify("The new order could not be saved.", "error");
      load();
    }
  };

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await api.post<{ id: string }>("/pages", { title, slug: slug || undefined });
      notify("Page created as a draft. Add sections, then publish it.");
      router.push(`/admin/pages/${res.id}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The page could not be created.", "error");
      setBusy(false);
    }
  };

  const remove = async (page: AdminPage) => {
    try {
      await api.del(`/pages/${page.id}`);
      notify(`“${page.title}” deleted.`);
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The page could not be deleted.", "error");
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Pages & sections"
        description="Every page on the website. Open one to edit its blocks, switch them off, or drag them into a different order. The order here is the order pages appear in menus that follow it."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            New page
          </Button>
        }
      />

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <Card title={`${pages.length} pages`} bodyClassName="p-3">
          <Sortable
            items={pages}
            getKey={(p) => p.id}
            onReorder={reorder}
            renderItem={(page, { index, moveUp, moveDown, dragHandle }) => (
              <div className="adm-row">
                <span className="adm-grip" {...dragHandle} aria-hidden="true">
                  ⠿
                </span>

                <Link href={`/admin/pages/${page.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-paper">{page.title}</span>
                  <span className="chart-label block truncate text-navy-300">
                    /{page.slug} · {page.sectionCount ?? page.sections.length} sections
                  </span>
                </Link>

                <span
                  className={`adm-pill ${page.status === "published" ? "adm-pill-live" : "adm-pill-draft"}`}
                >
                  {page.status === "published" ? "Live" : "Draft"}
                </span>

                {page.isSystem ? <span className="adm-pill adm-pill-off">Fixed route</span> : null}

                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-sm"
                >
                  View
                </a>

                <MoveButtons
                  index={index}
                  total={pages.length}
                  moveUp={moveUp}
                  moveDown={moveDown}
                  label={page.title}
                />

                {page.isSystem ? null : (
                  <ConfirmButton size="sm" confirmLabel="Delete page?" onConfirm={() => remove(page)}>
                    Delete
                  </ConfirmButton>
                )}
              </div>
            )}
          />
        </Card>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New page"
        size="sm"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} disabled={busy || !title.trim()}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput
            label="Page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Career"
            autoFocus
          />
          <TextInput
            label="Web address"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="career"
            help="Leave empty to build one from the title. Use a slash for a page inside a section, for example about/history."
          />
        </div>
      </Dialog>
    </div>
  );
}
