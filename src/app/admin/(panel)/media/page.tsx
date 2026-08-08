"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type MediaItem } from "@/components/admin/api";
import { MediaGrid, UploadButton, useMedia } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  ConfirmButton,
  Dialog,
  Note,
  Select,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";

interface Usage {
  albums: { id: string; title: string }[];
  albumCovers: { id: string; title: string }[];
  posts: { id: string; title: string }[];
  sections: { id: string; type: string; title: string }[];
}

const readableSize = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export default function MediaScreen() {
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const { items, loading, query, setQuery, reload, setItems } = useMedia(kind);
  const [editing, setEditing] = useState<MediaItem | null>(null);

  const missingAlt = items.filter((m) => m.kind === "image" && !m.alt.trim()).length;

  return (
    <div className="adm-body max-w-none">
      <ScreenHeader
        title="Photographs"
        description="Upload once, then use the same file in an album, on a page or inside a post. Alt text is what a screen reader announces, so write what is actually in the frame."
        actions={<UploadButton onUploaded={(m) => setItems((list) => [m, ...list])} label="Upload files" />}
      />

      {missingAlt > 0 ? (
        <div className="mb-4">
          <Note tone="warn">
            {missingAlt} photograph{missingAlt === 1 ? "" : "s"} have no alt text. Open one to add it —
            the site marks them until you do.
          </Note>
        </div>
      ) : null}

      <Card
        title={`${items.length} files`}
        actions={
          <>
            <input
              className="adm-input max-w-[16rem]"
              placeholder="Search name or alt text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              value={kind}
              options={[
                { value: "all", label: "Everything" },
                { value: "image", label: "Photographs" },
                { value: "video", label: "Films" },
              ]}
              onChange={(e) => setKind(e.target.value as "all" | "image" | "video")}
            />
            <Button onClick={reload}>Refresh</Button>
          </>
        }
      >
        {loading ? (
          <p className="chart-label text-navy-300">Loading…</p>
        ) : (
          <MediaGrid items={items} onSelect={setEditing} />
        )}
      </Card>

      <MediaDetail
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setItems((list) => list.map((m) => (m.id === updated.id ? updated : m)));
          setEditing(null);
        }}
        onDeleted={(id) => {
          setItems((list) => list.filter((m) => m.id !== id));
          setEditing(null);
        }}
      />
    </div>
  );
}

function MediaDetail({
  item,
  onClose,
  onSaved,
  onDeleted,
}: {
  item: MediaItem | null;
  onClose: () => void;
  onSaved: (item: MediaItem) => void;
  onDeleted: (id: string) => void;
}) {
  const { notify } = useToast();
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false);

  const open = !!item;

  // Opening the detail also loads where the file is used, so nothing is
  // deleted without the editor seeing what it will empty.
  useEffect(() => {
    if (!item) return;
    setAlt(item.alt);
    setCaption(item.caption);
    setUsage(null);

    let cancelled = false;
    api
      .get<Usage>(`/media/${item.id}/usage`)
      .then((u) => !cancelled && setUsage(u))
      .catch(() => !cancelled && setUsage({ albums: [], albumCovers: [], posts: [], sections: [] }));
    return () => {
      cancelled = true;
    };
  }, [item]);

  const close = () => {
    setAlt("");
    setCaption("");
    setUsage(null);
    onClose();
  };

  const save = async () => {
    if (!item) return;
    setBusy(true);
    try {
      await api.patch(`/media/${item.id}`, { alt, caption });
      notify("Saved.");
      onSaved({ ...item, alt, caption });
      setAlt("");
      setCaption("");
      setUsage(null);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!item) return;
    try {
      await api.del(`/media/${item.id}`);
      notify("File deleted.");
      onDeleted(item.id);
      setAlt("");
      setCaption("");
      setUsage(null);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The file could not be deleted.", "error");
    }
  };

  const usedIn = usage
    ? [
        ...usage.albums.map((a) => `Album: ${a.title}`),
        ...usage.albumCovers.map((a) => `Album cover: ${a.title}`),
        ...usage.posts.map((p) => `Post cover: ${p.title}`),
        ...usage.sections.map((s) => `${s.title} — ${s.type}`),
      ]
    : [];

  return (
    <Dialog
      open={open}
      onClose={close}
      title={item?.filename ?? "File"}
      footer={
        <>
          <span className="mr-auto">
            <ConfirmButton confirmLabel="Delete this file?" onConfirm={remove}>
              Delete
            </ConfirmButton>
          </span>
          <Button onClick={close}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      {item ? (
        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <div>
            {item.kind === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={item.url} controls className="w-full border-2 border-navy-700" />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.url} alt={item.alt} className="w-full border-2 border-navy-700" />
            )}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-navy-300">
              <div>
                <dt className="chart-label">Type</dt>
                <dd>{item.mime}</dd>
              </div>
              <div>
                <dt className="chart-label">Size</dt>
                <dd>{item.size ? readableSize(item.size) : "—"}</dd>
              </div>
              <div>
                <dt className="chart-label">Dimensions</dt>
                <dd>{item.width && item.height ? `${item.width} × ${item.height}` : "—"}</dd>
              </div>
              <div>
                <dt className="chart-label">Added</dt>
                <dd>{new Date(item.createdAt).toLocaleDateString("en-IN")}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <TextArea
              label="Alt text"
              rows={4}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              help="Describe what is in the frame — who, doing what, where. Not “school photo”."
            />
            <TextInput
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              help="Printed under the photograph where the layout shows captions."
            />

            <div>
              <span className="adm-label">Used in</span>
              {usage === null ? (
                <p className="text-sm text-navy-300">Checking…</p>
              ) : usedIn.length === 0 ? (
                <p className="text-sm text-navy-300">Nowhere yet — safe to delete.</p>
              ) : (
                <ul className="space-y-1 text-sm text-navy-200">
                  {usedIn.map((u) => (
                    <li key={u}>· {u}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
