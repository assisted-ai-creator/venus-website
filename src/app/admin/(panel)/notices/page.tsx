"use client";

/**
 * The notice board.
 *
 * A notice is small enough to write in one dialog, so this is a single screen
 * rather than a list plus an editor route: the office opens the panel, types
 * four fields and saves, and it is on the website. That speed is the point —
 * a notice board nobody updates is worse than none.
 *
 * The list is in the order a parent reads it, pinned first and then newest, so
 * what the school sees here is what the website shows.
 */

import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminNotice, type MediaItem } from "@/components/admin/api";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  ConfirmButton,
  Dialog,
  Empty,
  Note,
  Select,
  Switch,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";

/** The kinds the site styles. The field is free text; these are the shortcuts. */
const KINDS = ["Notice", "Admission", "Achievement", "Event", "Result"];

const BLANK = {
  title: "",
  kind: "Notice",
  body: "",
  date: "",
  href: "",
  fileMediaId: null as string | null,
  pinned: false,
  status: "published",
  expiresOn: "",
};

type Draft = typeof BLANK;

const todayIso = () => new Date().toISOString().slice(0, 10);

const readable = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : iso;

/** True once the day named has passed, judged the way the website judges it. */
const hasLapsed = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso < todayIso();

export default function NoticesScreen() {
  const { notify } = useToast();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminNotice | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [file, setFile] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ notices: AdminNotice[] }>("/notices");
      setNotices(res.notices);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The notices could not be loaded.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setDraft({ ...BLANK, date: todayIso() });
    setFile(null);
    setOpen(true);
  };

  const openExisting = (n: AdminNotice) => {
    setEditing(n);
    setDraft({
      title: n.title,
      kind: n.kind,
      body: n.body,
      date: n.date,
      href: n.href,
      fileMediaId: n.fileMediaId,
      pinned: n.pinned,
      status: n.status,
      expiresOn: n.expiresOn,
    });
    setFile(
      n.file ? { ...(n.file as MediaItem), id: n.fileMediaId ?? "", kind: "file" } as MediaItem : null
    );
    setOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      notify("Give the notice a title before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.patch(`/notices/${editing.id}`, draft);
      else await api.post("/notices", draft);
      notify(
        draft.status === "published"
          ? `“${draft.title}” is on the website.`
          : `“${draft.title}” saved as a draft.`
      );
      setOpen(false);
      load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The notice could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (n: AdminNotice) => {
    try {
      await api.del(`/notices/${n.id}`);
      notify(`“${n.title}” deleted.`);
      load();
    } catch {
      notify("The notice could not be deleted.", "error");
    }
  };

  /** Publish, unpublish and pin without opening the dialog. */
  const patch = async (n: AdminNotice, change: Partial<Draft>, message: string) => {
    try {
      await api.patch(`/notices/${n.id}`, change);
      notify(message);
      load();
    } catch {
      notify("That change could not be saved.", "error");
    }
  };

  const live = notices.filter((n) => n.status === "published" && !hasLapsed(n.expiresOn));
  const lapsed = notices.filter((n) => n.status === "published" && hasLapsed(n.expiresOn));
  const drafts = notices.filter((n) => n.status !== "published");

  const Row = ({ notice }: { notice: AdminNotice }) => (
    <div className="adm-row">
      <button type="button" onClick={() => openExisting(notice)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-paper">{notice.title}</span>
        <span className="chart-label block truncate text-navy-300">
          {notice.kind}
          {notice.date ? ` · ${readable(notice.date)}` : ""}
          {notice.file ? ` · ${notice.file.filename}` : ""}
          {notice.expiresOn ? ` · until ${readable(notice.expiresOn)}` : ""}
        </span>
      </button>

      {notice.pinned ? <span className="adm-pill adm-pill-live">Pinned</span> : null}

      <Button
        size="sm"
        onClick={() =>
          patch(
            notice,
            { pinned: !notice.pinned },
            notice.pinned ? "Unpinned." : `“${notice.title}” pinned to the top.`
          )
        }
      >
        {notice.pinned ? "Unpin" : "Pin"}
      </Button>

      <Button
        size="sm"
        onClick={() =>
          patch(
            notice,
            { status: notice.status === "published" ? "draft" : "published" },
            notice.status === "published" ? "Taken off the website." : "Published."
          )
        }
      >
        {notice.status === "published" ? "Take down" : "Publish"}
      </Button>

      <ConfirmButton size="sm" confirmLabel="Delete notice?" onConfirm={() => remove(notice)}>
        Delete
      </ConfirmButton>
    </div>
  );

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Notices"
        description="The school's notice board. A notice written here appears on the home page and on the Notices page at once — there is nothing else to update."
        actions={
          <>
            <a href="/notices" target="_blank" rel="noopener noreferrer" className="adm-btn">
              View the board
            </a>
            <Button variant="primary" onClick={openNew}>
              Write a notice
            </Button>
          </>
        }
      />

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <div className="space-y-5">
          <Card title={`${live.length} on the website`} bodyClassName="space-y-2 p-3">
            {live.length === 0 ? (
              <Empty>Nothing on the notice board. Write a notice and it is live immediately.</Empty>
            ) : (
              live.map((n) => <Row key={n.id} notice={n} />)
            )}
          </Card>

          {drafts.length ? (
            <Card title={`${drafts.length} drafts`} bodyClassName="space-y-2 p-3">
              {drafts.map((n) => (
                <Row key={n.id} notice={n} />
              ))}
            </Card>
          ) : null}

          {lapsed.length ? (
            <Card title={`${lapsed.length} lapsed`} bodyClassName="space-y-2 p-3">
              <Note tone="warn">
                These are past the date they were set to come down, so parents no longer see them.
                They are kept here until you delete them.
              </Note>
              {lapsed.map((n) => (
                <Row key={n.id} notice={n} />
              ))}
            </Card>
          ) : null}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit the notice" : "Write a notice"}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput
            label="Title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="School closed on 14 November"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Kind"
              value={KINDS.includes(draft.kind) ? draft.kind : KINDS[0]}
              onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value }))}
              options={KINDS.map((k) => ({ value: k, label: k }))}
              help="Printed as the small label above the title."
            />
            <TextInput
              label="Date"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              help="The notice's own date — what it is about, not when you typed it."
            />
          </div>

          <TextArea
            label="Text"
            rows={4}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            help="A sentence or two. Anything longer belongs in a blog post the notice links to."
          />

          <TextInput
            label="Links to"
            value={draft.href}
            onChange={(e) => setDraft((d) => ({ ...d, href: e.target.value }))}
            placeholder="/admissions or https://…"
            help="Optional. Makes the title a link."
          />

          <div>
            <span className="adm-label">Attachment</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-navy-200">
                {file ? file.filename : "No circular attached"}
              </span>
              <Button size="sm" className="ml-auto" onClick={() => setPicking(true)}>
                {file ? "Change" : "Attach a PDF"}
              </Button>
              {file ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setDraft((d) => ({ ...d, fileMediaId: null }));
                  }}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="adm-help">
              A circular, planner or result sheet. Parents see its name and size before they tap it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Stop showing after"
              type="date"
              value={draft.expiresOn}
              onChange={(e) => setDraft((d) => ({ ...d, expiresOn: e.target.value }))}
              help="Optional. The notice comes down by itself the day after. Leave empty to keep it up."
            />
            <Select
              label="Status"
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              options={[
                { value: "published", label: "On the website" },
                { value: "draft", label: "Draft — not shown" },
              ]}
            />
          </div>

          <Switch
            label="Pin to the top"
            checked={draft.pinned}
            onChange={(v) => setDraft((d) => ({ ...d, pinned: v }))}
            help="Held above the dated notices, whatever its date."
          />
        </div>
      </Dialog>

      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        kind="file"
        title="Choose a document"
        onPick={([item]) => {
          if (!item) return;
          setFile(item);
          setDraft((d) => ({ ...d, fileMediaId: item.id }));
        }}
      />
    </div>
  );
}
