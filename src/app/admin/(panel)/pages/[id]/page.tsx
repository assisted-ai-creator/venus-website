"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminPage, type AdminSection } from "@/components/admin/api";
import { SchemaForm } from "@/components/admin/SchemaForm";
import {
  Button,
  Card,
  ConfirmButton,
  Dialog,
  MoveButtons,
  Note,
  Select,
  Sortable,
  Switch,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";
import {
  LAYOUT_FIELDS,
  SECTIONS,
  SECTION_BY_TYPE,
  SECTION_GROUPS,
  type Field,
} from "@/lib/sections/registry";

type Data = Record<string, unknown>;

/**
 * The page editor.
 *
 * The left column is the running order of the page — drag a block, switch it
 * off, send it to another page. The right column edits whichever block is
 * selected, using the form its type declares. Saving writes straight through
 * to the live site.
 */
export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();

  const [page, setPage] = useState<AdminPage | null>(null);
  const [allPages, setAllPages] = useState<AdminPage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Data>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    const [one, all] = await Promise.all([
      api.get<{ page: AdminPage }>(`/pages/${id}`),
      api.get<{ pages: AdminPage[] }>("/pages"),
    ]);
    setPage(one.page);
    setAllPages(all.pages);
    setSelected((current) => current ?? one.page.sections[0]?.id ?? null);
  }, [id]);

  useEffect(() => {
    load().catch(() => notify("This page could not be loaded.", "error"));
  }, [load, notify]);

  const section = useMemo(
    () => page?.sections.find((s) => s.id === selected) ?? null,
    [page, selected]
  );

  // Loading a different block discards nothing: the draft is only ever the
  // block currently open, and the Save button is the single write path.
  useEffect(() => {
    setDraft(section ? { ...section.data } : {});
    setDirty(false);
  }, [section]);

  const def = section ? SECTION_BY_TYPE[section.type] : undefined;

  /* ------------------------------------------------------------- actions --- */

  const saveSection = async () => {
    if (!section) return;
    setSaving(true);
    try {
      await api.patch(`/pages/sections/${section.id}`, { data: draft });
      notify("Saved. The change is live on the website.");
      setDirty(false);
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addSection = async (type: string) => {
    const definition = SECTION_BY_TYPE[type];
    setAdding(false);
    try {
      const res = await api.post<{ section: AdminSection }>(`/pages/${id}/sections`, {
        type,
        label: definition?.name ?? type,
        data: { ...(definition?.defaults ?? {}), layout: { ground: "wall", column: "full" } },
      });
      await load();
      if (res.section) setSelected(res.section.id);
      notify(`${definition?.name ?? "Section"} added.`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The section could not be added.", "error");
    }
  };

  const patchSection = async (sectionId: string, body: Data, message?: string) => {
    try {
      await api.patch(`/pages/sections/${sectionId}`, body);
      await load();
      if (message) notify(message);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    }
  };

  const removeSection = async (sectionId: string) => {
    try {
      await api.del(`/pages/sections/${sectionId}`);
      if (selected === sectionId) setSelected(null);
      await load();
      notify("Section removed.");
    } catch {
      notify("The section could not be removed.", "error");
    }
  };

  const reorder = async (ids: string[]) => {
    if (!page) return;
    const byId = new Map(page.sections.map((s) => [s.id, s]));
    setPage({ ...page, sections: ids.map((i) => byId.get(i)).filter((s): s is AdminSection => !!s) });
    try {
      await api.post(`/pages/${id}/sections/reorder`, { ids });
    } catch {
      notify("The new order could not be saved.", "error");
      load();
    }
  };

  const moveToPage = async (sectionId: string, targetPageId: string) => {
    try {
      await api.post(`/pages/sections/${sectionId}/move`, { pageId: targetPageId });
      setSelected(null);
      await load();
      notify("Section moved.");
    } catch {
      notify("The section could not be moved.", "error");
    }
  };

  const duplicate = async (sectionId: string) => {
    try {
      await api.post(`/pages/sections/${sectionId}/duplicate`, {});
      await load();
      notify("Section duplicated.");
    } catch {
      notify("The section could not be duplicated.", "error");
    }
  };

  if (!page) {
    return (
      <div className="adm-body">
        <p className="chart-label text-navy-300">Loading…</p>
      </div>
    );
  }

  const layout = (draft.layout as Data) ?? {};

  return (
    <div className="adm-body max-w-none">
      <ScreenHeader
        title={page.title}
        description={`/${page.slug}`}
        actions={
          <>
            <Link href="/admin/pages" className="adm-btn">
              All pages
            </Link>
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn">
              View page
            </a>
            <Button onClick={() => setSettingsOpen(true)}>Page settings</Button>
            <Button variant="primary" onClick={() => setAdding(true)}>
              Add a section
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
        {/* ------------------------------------------------ running order --- */}
        <Card title="Running order" bodyClassName="p-3">
          {page.sections.length === 0 ? (
            <p className="border-2 border-dashed border-navy-700 px-3 py-6 text-center text-sm text-navy-300">
              This page is empty. Add a section to begin.
            </p>
          ) : (
            <Sortable
              items={page.sections}
              getKey={(s) => s.id}
              onReorder={reorder}
              renderItem={(s, { index, moveUp, moveDown, dragHandle }) => {
                const d = SECTION_BY_TYPE[s.type];
                const column = ((s.data.layout as Data)?.column as string) ?? "full";
                return (
                  <div
                    className="adm-row"
                    data-disabled={!s.enabled}
                    aria-current={selected === s.id ? "true" : undefined}
                    style={selected === s.id ? { borderColor: "var(--color-saffron)" } : undefined}
                  >
                    <span className="adm-grip" {...dragHandle} aria-hidden="true">
                      ⠿
                    </span>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelected(s.id)}
                    >
                      <span className="block truncate text-sm text-paper">
                        {s.label || d?.name || s.type}
                      </span>
                      <span className="chart-label block truncate text-navy-300">
                        {d?.name ?? s.type}
                        {column !== "full" ? ` · ${column} column` : ""}
                      </span>
                    </button>
                    <MoveButtons
                      index={index}
                      total={page.sections.length}
                      moveUp={moveUp}
                      moveDown={moveDown}
                      label={s.label || d?.name || s.type}
                    />
                  </div>
                );
              }}
            />
          )}
        </Card>

        {/* ------------------------------------------------------- editor --- */}
        {!section ? (
          <Card title="Nothing selected">
            <p className="text-sm text-navy-200">
              Choose a section on the left to edit it, or add a new one.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            <Card
              title={def?.name ?? section.type}
              actions={
                <>
                  <Switch
                    checked={section.enabled}
                    label={section.enabled ? "Showing" : "Hidden"}
                    onChange={(v) =>
                      patchSection(
                        section.id,
                        { enabled: v },
                        v ? "Section is showing on the site." : "Section hidden from the site."
                      )
                    }
                  />
                  <Button size="sm" onClick={() => duplicate(section.id)}>
                    Duplicate
                  </Button>
                  <ConfirmButton
                    size="sm"
                    confirmLabel="Remove section?"
                    onConfirm={() => removeSection(section.id)}
                  >
                    Remove
                  </ConfirmButton>
                </>
              }
            >
              {def?.description ? (
                <p className="mb-4 text-sm text-navy-300">{def.description}</p>
              ) : (
                <Note tone="warn">
                  This block has type “{section.type}”, which this version of the website does not
                  know how to draw. It will not appear until the site is updated.
                </Note>
              )}

              <TextInput
                label="Name in this list"
                className="mb-5"
                value={section.label}
                onChange={(e) => setPage({ ...page, sections: page.sections.map((s) => (s.id === section.id ? { ...s, label: e.target.value } : s)) })}
                onBlur={(e) => patchSection(section.id, { label: e.target.value })}
                help="Only you see this. It makes a long page easier to navigate."
              />

              {def ? (
                <SchemaForm
                  fields={def.fields}
                  value={draft}
                  onChange={(next) => {
                    setDraft(next);
                    setDirty(true);
                  }}
                />
              ) : null}
            </Card>

            <Card title="Placement">
              <SchemaForm
                fields={LAYOUT_FIELDS as Field[]}
                value={layout}
                onChange={(next) => {
                  setDraft({ ...draft, layout: next });
                  setDirty(true);
                }}
                className="grid gap-4 sm:grid-cols-2"
              />

              <div className="mt-5 border-t-2 border-navy-700 pt-4">
                <Select
                  label="Move to another page"
                  value=""
                  options={[
                    { value: "", label: "Keep on this page" },
                    ...allPages
                      .filter((p) => p.id !== page.id)
                      .map((p) => ({ value: p.id, label: `${p.title} (/${p.slug})` })),
                  ]}
                  onChange={(e) => e.target.value && moveToPage(section.id, e.target.value)}
                  help="The section keeps its content and settings, and is added at the end of the chosen page."
                />
              </div>
            </Card>

            <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-3 border-t-2 border-navy-700 bg-navy-900/95 px-1 py-3 backdrop-blur">
              <Button variant="primary" onClick={saveSection} disabled={saving || !dirty}>
                {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </Button>
              {dirty ? (
                <>
                  <Button
                    onClick={() => {
                      setDraft({ ...section.data });
                      setDirty(false);
                    }}
                  >
                    Discard
                  </Button>
                  <span className="text-sm text-saffron">Unsaved changes</span>
                </>
              ) : (
                <span className="text-sm text-navy-300">Everything here is live on the website.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- add block --- */}
      <Dialog open={adding} onClose={() => setAdding(false)} title="Add a section">
        <div className="space-y-6">
          {SECTION_GROUPS.map((group) => {
            const items = SECTIONS.filter((s) => s.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <p className="adm-nav-group !px-0">{group}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {items.map((s) => (
                    <li key={s.type}>
                      <button
                        type="button"
                        className="adm-card w-full p-3 text-left transition-transform hover:-translate-y-0.5"
                        onClick={() => addSection(s.type)}
                      >
                        <span className="block text-sm font-semibold text-paper">{s.name}</span>
                        <span className="mt-1 block text-xs text-navy-300">{s.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Dialog>

      <PageSettings
        page={page}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={async (deleted) => {
          setSettingsOpen(false);
          if (deleted) router.push("/admin/pages");
          else await load();
        }}
      />
    </div>
  );
}

/* --------------------------------------------------------- page settings --- */

function PageSettings({
  page,
  open,
  onClose,
  onSaved,
}: {
  page: AdminPage;
  open: boolean;
  onClose: () => void;
  onSaved: (deleted: boolean) => void;
}) {
  const { notify } = useToast();
  const [form, setForm] = useState({
    title: page.title,
    slug: page.slug,
    navLabel: page.navLabel,
    status: page.status,
    showInNav: page.showInNav,
    seoTitle: String(page.seo.title ?? ""),
    seoDescription: String(page.seo.description ?? ""),
    noindex: page.seo.noindex === true,
    headerVariant: String(page.header.variant ?? "sheet"),
    headerTitle: String(page.header.title ?? ""),
    headerDeva: String(page.header.deva ?? ""),
    standfirst: String(page.header.standfirst ?? ""),
  });
  const [meta, setMeta] = useState<{ label: string; value: string }[]>(
    Array.isArray(page.header.meta) ? (page.header.meta as { label: string; value: string }[]) : []
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: page.title,
      slug: page.slug,
      navLabel: page.navLabel,
      status: page.status,
      showInNav: page.showInNav,
      seoTitle: String(page.seo.title ?? ""),
      seoDescription: String(page.seo.description ?? ""),
      noindex: page.seo.noindex === true,
      headerVariant: String(page.header.variant ?? "sheet"),
      headerTitle: String(page.header.title ?? ""),
      headerDeva: String(page.header.deva ?? ""),
      standfirst: String(page.header.standfirst ?? ""),
    });
    setMeta(Array.isArray(page.header.meta) ? (page.header.meta as { label: string; value: string }[]) : []);
  }, [open, page]);

  const save = async () => {
    setBusy(true);
    try {
      await api.patch(`/pages/${page.id}`, {
        title: form.title,
        slug: page.isSystem ? undefined : form.slug,
        navLabel: form.navLabel,
        status: form.status,
        showInNav: form.showInNav,
        seo: {
          title: form.seoTitle || undefined,
          description: form.seoDescription || undefined,
          noindex: form.noindex || undefined,
        },
        header: {
          variant: form.headerVariant,
          title: form.headerTitle || undefined,
          deva: form.headerDeva || undefined,
          standfirst: form.standfirst || undefined,
          meta: meta.filter((m) => m.label || m.value),
        },
      });
      notify("Page settings saved.");
      onSaved(false);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Settings could not be saved.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.del(`/pages/${page.id}`);
      notify("Page deleted.");
      onSaved(true);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The page could not be deleted.", "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Page settings"
      footer={
        <>
          {page.isSystem ? null : (
            <span className="mr-auto">
              <ConfirmButton confirmLabel="Delete this page?" onConfirm={remove}>
                Delete page
              </ConfirmButton>
            </span>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save settings"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextInput
          label="Web address"
          value={form.slug}
          disabled={page.isSystem}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          help={
            page.isSystem
              ? "This page has a fixed route in the website's code and cannot be moved."
              : "Without a leading slash. Use about/history for a page inside About."
          }
        />
        <TextInput
          label="Menu label"
          value={form.navLabel}
          onChange={(e) => setForm({ ...form, navLabel: e.target.value })}
        />
        <Select
          label="Status"
          value={form.status}
          disabled={page.isSystem}
          options={[
            { value: "published", label: "Published — visible to everyone" },
            { value: "draft", label: "Draft — hidden from the website" },
          ]}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        />

        <div className="sm:col-span-2">
          <Switch
            checked={form.showInNav}
            label="Offer this page in menus that list child pages"
            onChange={(v) => setForm({ ...form, showInNav: v })}
          />
        </div>

        <hr className="rule-double sm:col-span-2 text-navy-700" />

        <Select
          label="Sheet header"
          value={form.headerVariant}
          options={[
            { value: "sheet", label: "Show the standard page header" },
            { value: "none", label: "No header — the first section opens the page" },
          ]}
          onChange={(e) => setForm({ ...form, headerVariant: e.target.value })}
          className="sm:col-span-2"
        />

        {form.headerVariant !== "none" ? (
          <>
            <TextInput
              label="Header title"
              value={form.headerTitle}
              onChange={(e) => setForm({ ...form, headerTitle: e.target.value })}
              help="Leave empty to use the page title."
            />
            <TextInput
              label="Devanagari line"
              value={form.headerDeva}
              onChange={(e) => setForm({ ...form, headerDeva: e.target.value })}
            />
            <TextArea
              label="Standfirst"
              className="sm:col-span-2"
              rows={3}
              value={form.standfirst}
              onChange={(e) => setForm({ ...form, standfirst: e.target.value })}
            />

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="adm-label !mb-0">Header facts</span>
                <Button size="sm" onClick={() => setMeta([...meta, { label: "", value: "" }])}>
                  Add a fact
                </Button>
              </div>
              <div className="space-y-2">
                {meta.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="adm-input"
                      placeholder="Label"
                      value={m.label}
                      onChange={(e) =>
                        setMeta(meta.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)))
                      }
                    />
                    <input
                      className="adm-input"
                      placeholder="Value"
                      value={m.value}
                      onChange={(e) =>
                        setMeta(meta.map((x, n) => (n === i ? { ...x, value: e.target.value } : x)))
                      }
                    />
                    <Button size="sm" onClick={() => setMeta(meta.filter((_, n) => n !== i))}>
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <hr className="rule-double sm:col-span-2 text-navy-700" />

        <TextInput
          label="Search-result title"
          className="sm:col-span-2"
          value={form.seoTitle}
          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          help="Leave empty to use the page title."
        />
        <TextArea
          label="Search-result description"
          className="sm:col-span-2"
          rows={2}
          value={form.seoDescription}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
        />
        <div className="sm:col-span-2">
          <Switch
            checked={form.noindex}
            label="Keep this page out of search engines"
            onChange={(v) => setForm({ ...form, noindex: v })}
          />
        </div>
      </div>
    </Dialog>
  );
}
