"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminAlbum, type MediaItem } from "@/components/admin/api";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  Button,
  Card,
  ConfirmButton,
  MoveButtons,
  Select,
  Sortable,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";

export default function AlbumEditor() {
  const { id } = useParams<{ id: string }>();
  const { notify } = useToast();

  const [album, setAlbum] = useState<AdminAlbum | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", category: "", description: "", date: "", status: "published" });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<{ album: AdminAlbum }>(`/albums/${id}`);
    setAlbum(res.album);
    setForm({
      title: res.album.title,
      slug: res.album.slug,
      category: res.album.category,
      description: res.album.description,
      date: res.album.date,
      status: res.album.status,
    });
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load().catch(() => notify("This album could not be loaded.", "error"));
  }, [load, notify]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/albums/${id}`, form);
      notify("Saved. The album is live on the website.");
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addPhotos = async (items: MediaItem[]) => {
    try {
      await api.post(`/albums/${id}/photos`, { mediaIds: items.map((m) => m.id) });
      await load();
      notify(`${items.length} photograph${items.length === 1 ? "" : "s"} added.`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Those could not be added.", "error");
    }
  };

  const removePhoto = async (mediaId: string) => {
    try {
      await api.del(`/albums/${id}/photos/${mediaId}`);
      await load();
    } catch {
      notify("The photograph could not be removed.", "error");
    }
  };

  const reorder = async (mediaIds: string[]) => {
    if (!album) return;
    const byId = new Map(album.photos.map((p) => [p.id, p]));
    setAlbum({ ...album, photos: mediaIds.map((m) => byId.get(m)).filter((p): p is MediaItem => !!p) });
    try {
      await api.post(`/albums/${id}/photos/reorder`, { mediaIds });
    } catch {
      notify("The new order could not be saved.", "error");
      load();
    }
  };

  const setCover = async (mediaId: string) => {
    try {
      await api.patch(`/albums/${id}`, { coverMediaId: mediaId });
      await load();
      notify("Cover updated.");
    } catch {
      notify("The cover could not be set.", "error");
    }
  };

  if (!album) {
    return (
      <div className="adm-body">
        <p className="chart-label text-navy-300">Loading…</p>
      </div>
    );
  }

  return (
    <div className="adm-body">
      <ScreenHeader
        title={album.title}
        description={`/gallery/${album.slug}`}
        actions={
          <>
            <Link href="/admin/albums" className="adm-btn">
              All albums
            </Link>
            <a
              href={`/gallery/${album.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="adm-btn"
            >
              View album
            </a>
            <Button variant="primary" onClick={save} disabled={saving || !dirty}>
              {saving ? "Saving…" : dirty ? "Save details" : "Saved"}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <Card title="Album details">
          <div className="space-y-4">
            <TextInput
              label="Title"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setDirty(true);
              }}
            />
            <TextInput
              label="Web address"
              value={form.slug}
              onChange={(e) => {
                setForm({ ...form, slug: e.target.value });
                setDirty(true);
              }}
              help={`Currently /gallery/${album.slug}`}
            />
            <TextInput
              label="Category"
              value={form.category}
              onChange={(e) => {
                setForm({ ...form, category: e.target.value });
                setDirty(true);
              }}
              help="Albums are grouped under this heading on the gallery page."
            />
            <TextInput
              label="Date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                setDirty(true);
              }}
              placeholder="January 2026"
            />
            <TextArea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setDirty(true);
              }}
            />
            <Select
              label="Status"
              value={form.status}
              options={[
                { value: "published", label: "Published — visible on the gallery" },
                { value: "draft", label: "Draft — hidden from the website" },
              ]}
              onChange={(e) => {
                setForm({ ...form, status: e.target.value });
                setDirty(true);
              }}
            />
          </div>
        </Card>

        <Card
          title={`${album.photos.length} photographs`}
          actions={
            <Button variant="primary" onClick={() => setPicking(true)}>
              Add photographs
            </Button>
          }
          bodyClassName="p-3"
        >
          {album.photos.length === 0 ? (
            <p className="border-2 border-dashed border-navy-700 px-3 py-8 text-center text-sm text-navy-300">
              This album is empty. Add photographs from the library.
            </p>
          ) : (
            <Sortable
              items={album.photos}
              getKey={(p) => p.id}
              onReorder={reorder}
              renderItem={(photo, { index, moveUp, moveDown, dragHandle }) => (
                <div className="adm-row">
                  <span className="adm-grip" {...dragHandle} aria-hidden="true">
                    ⠿
                  </span>
                  <span className="h-12 w-16 flex-none overflow-hidden border-2 border-navy-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-paper">{photo.filename}</span>
                    <span
                      className={`block truncate text-xs ${photo.alt ? "text-navy-300" : "text-saffron"}`}
                    >
                      {photo.alt || "No alt text — add one on the Photographs screen"}
                    </span>
                  </span>

                  {album.coverMediaId === photo.id ? (
                    <span className="adm-pill adm-pill-live">Cover</span>
                  ) : (
                    <Button size="sm" onClick={() => setCover(photo.id)}>
                      Make cover
                    </Button>
                  )}

                  <MoveButtons
                    index={index}
                    total={album.photos.length}
                    moveUp={moveUp}
                    moveDown={moveDown}
                    label={photo.filename}
                  />

                  <ConfirmButton
                    size="sm"
                    confirmLabel="Remove?"
                    onConfirm={() => removePhoto(photo.id)}
                  >
                    Remove
                  </ConfirmButton>
                </div>
              )}
            />
          )}
        </Card>
      </div>

      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        multiple
        title="Add photographs to this album"
        onPick={addPhotos}
      />
    </div>
  );
}
