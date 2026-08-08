"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type MediaItem } from "./api";
import { Button, Dialog, Empty, Note, useToast } from "./ui";

/**
 * The media library, used both as a full screen and as a picker inside a form.
 *
 * Alt text is a first-class field rather than an afterthought: the site's
 * accessibility commitment is that every photograph describes what is actually
 * in the frame, and the only place that can be entered is here.
 */

export function useMedia(kind: "all" | "image" | "video" | "file" = "all") {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (kind !== "all") params.set("kind", kind);
      if (query) params.set("q", query);
      const res = await api.get<{ media: MediaItem[] }>(`/media?${params}`);
      setItems(res.media);
    } finally {
      setLoading(false);
    }
  }, [kind, query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  return { items, loading, query, setQuery, reload: load, setItems };
}

/* ---------------------------------------------------------------- upload --- */

export function UploadButton({
  onUploaded,
  kind = "all",
  label = "Upload",
}: {
  onUploaded: (item: MediaItem) => void;
  kind?: "all" | "image" | "video" | "file";
  label?: string;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const { notify } = useToast();

  const IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
  const VIDEOS = "video/mp4,video/webm";
  const accept =
    kind === "image"
      ? IMAGES
      : kind === "video"
        ? VIDEOS
        : kind === "file"
          ? "application/pdf"
          : `${IMAGES},${VIDEOS},application/pdf`;

  const send = async (files: FileList) => {
    setBusy(true);
    let done = 0;

    for (const file of Array.from(files)) {
      setProgress(`${done + 1} of ${files.length}`);
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await api.upload<{ media: MediaItem }>("/media", form);
        if (res.media) onUploaded(res.media);
        done++;
      } catch (err) {
        notify(
          `${file.name}: ${err instanceof ApiError ? err.message : "upload failed"}`,
          "error"
        );
      }
    }

    if (done) notify(`${done} file${done === 1 ? "" : "s"} uploaded. Add alt text before using them.`);
    setBusy(false);
    setProgress("");
    if (input.current) input.current.value = "";
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => e.target.files?.length && send(e.target.files)}
      />
      <Button variant="primary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? `Uploading ${progress}…` : label}
      </Button>
    </>
  );
}

/* ------------------------------------------------------------------ grid --- */

export function MediaGrid({
  items,
  selected,
  onSelect,
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
}: {
  items: MediaItem[];
  selected?: string[];
  onSelect: (item: MediaItem) => void;
  columns?: string;
}) {
  if (!items.length) return <Empty>No files yet. Upload a photograph to begin.</Empty>;

  return (
    <ul className={`grid gap-3 ${columns}`}>
      {items.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            className="adm-tile text-left"
            data-selected={selected?.includes(m.id) ? "true" : undefined}
            onClick={() => onSelect(m)}
          >
            {m.kind === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={m.url} muted playsInline preload="metadata" />
            ) : m.kind === "file" ? (
              // A document has no frame to show, so the tile states what it is.
              <span className="grid h-full w-full place-items-center bg-navy-900 p-3 text-center">
                <span className="chart-label text-navy-300">
                  {(m.mime.split("/").pop() ?? "file").toUpperCase()}
                </span>
              </span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={m.url} alt={m.alt || m.filename} loading="lazy" decoding="async" />
            )}
            <span className="adm-tile-meta block">
              <span className="block truncate text-paper">{m.filename || m.key}</span>
              {/* Alt text describes a picture. A document is named, not described. */}
              {m.kind === "file" ? (
                <span className="text-navy-300">{m.size ? `${Math.round(m.size / 1024)} KB` : "Document"}</span>
              ) : (
                <span className={m.alt ? "text-navy-300" : "text-saffron"}>
                  {m.alt ? m.alt.slice(0, 48) : "No alt text"}
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- picker --- */

export function MediaPicker({
  open,
  onClose,
  onPick,
  kind = "image",
  multiple = false,
  title = "Choose a photograph",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (items: MediaItem[]) => void;
  kind?: "all" | "image" | "video" | "file";
  multiple?: boolean;
  title?: string;
}) {
  const { items, loading, query, setQuery, reload, setItems } = useMedia(kind);
  const [chosen, setChosen] = useState<string[]>([]);

  useEffect(() => {
    if (open) setChosen([]);
  }, [open]);

  const toggle = (m: MediaItem) => {
    if (!multiple) {
      onPick([m]);
      onClose();
      return;
    }
    setChosen((c) => (c.includes(m.id) ? c.filter((id) => id !== m.id) : [...c, m.id]));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        multiple ? (
          <>
            <span className="mr-auto self-center text-sm text-navy-300">
              {chosen.length} selected
            </span>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!chosen.length}
              onClick={() => {
                onPick(items.filter((m) => chosen.includes(m.id)));
                onClose();
              }}
            >
              Add {chosen.length || ""}
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="adm-input max-w-xs"
          placeholder="Search by name or alt text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <UploadButton
          kind={kind}
          onUploaded={(m) => {
            setItems((list) => [m, ...list]);
            if (multiple) setChosen((c) => [...c, m.id]);
          }}
        />
        <Button onClick={reload}>Refresh</Button>
      </div>

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <MediaGrid items={items} selected={chosen} onSelect={toggle} />
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------- single-field UI --- */

/** The `media` field type: a thumbnail, a Choose button and a Clear button. */
export function MediaField({
  value,
  onChange,
  kind = "image",
  label,
  help,
}: {
  value: string;
  onChange: (mediaId: string, item: MediaItem | null) => void;
  kind?: "all" | "image" | "video" | "file";
  label?: string;
  help?: string;
}) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!value) {
      setItem(null);
      return;
    }
    let cancelled = false;
    api
      .get<{ media: MediaItem[] }>(`/media?limit=500`)
      .then((r) => {
        if (!cancelled) setItem(r.media.find((m) => m.id === value) ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div>
      {label ? <span className="adm-label">{label}</span> : null}
      <div className="flex items-center gap-3">
        <div className="h-16 w-20 flex-none overflow-hidden border-2 border-navy-700 bg-navy-900">
          {item ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-navy-300">None</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            {value ? "Change" : "Choose"}
          </Button>
          {value ? (
            <Button size="sm" onClick={() => onChange("", null)}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      {item && !item.alt ? (
        <div className="mt-2">
          <Note tone="warn">
            This photograph has no alt text. Add one on the Photographs screen so screen-reader
            users know what it shows.
          </Note>
        </div>
      ) : null}
      {help ? <p className="adm-help">{help}</p> : null}

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        onPick={(picked) => {
          const first = picked[0];
          if (first) {
            setItem(first);
            onChange(first.id, first);
          }
        }}
      />
    </div>
  );
}
