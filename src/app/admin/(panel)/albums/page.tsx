"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminAlbum } from "@/components/admin/api";
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

export default function AlbumsScreen() {
  const router = useRouter();
  const { notify } = useToast();
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ albums: AdminAlbum[] }>("/albums");
      setAlbums(res.albums);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = [...new Set(albums.map((a) => a.category).filter(Boolean))];

  const create = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await api.post<{ id: string }>("/albums", { title, category });
      notify("Album created. Add photographs to it next.");
      router.push(`/admin/albums/${res.id}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The album could not be created.", "error");
      setBusy(false);
    }
  };

  const reorder = async (ids: string[]) => {
    const byId = new Map(albums.map((a) => [a.id, a]));
    setAlbums(ids.map((id) => byId.get(id)).filter((a): a is AdminAlbum => !!a));
    try {
      await api.post("/albums/reorder", { ids });
    } catch {
      notify("The new order could not be saved.", "error");
      load();
    }
  };

  const remove = async (album: AdminAlbum) => {
    try {
      await api.del(`/albums/${album.id}`);
      notify(`“${album.title}” deleted. The photographs stay in the library.`);
      load();
    } catch {
      notify("The album could not be deleted.", "error");
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Albums"
        description="Gallery albums, in the order they appear on the site. A photograph can sit in as many albums as you like — albums point at the library rather than holding their own copies."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            New album
          </Button>
        }
      />

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : albums.length === 0 ? (
        <Card>
          <p className="text-sm text-navy-200">
            No albums yet. Create one, then add photographs from the library.
          </p>
        </Card>
      ) : (
        <Card title={`${albums.length} albums`} bodyClassName="p-3">
          <Sortable
            items={albums}
            getKey={(a) => a.id}
            onReorder={reorder}
            renderItem={(album, { index, moveUp, moveDown, dragHandle }) => (
              <div className="adm-row">
                <span className="adm-grip" {...dragHandle} aria-hidden="true">
                  ⠿
                </span>

                <span className="h-12 w-16 flex-none overflow-hidden border-2 border-navy-700 bg-navy-900">
                  {album.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={album.cover} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </span>

                <Link href={`/admin/albums/${album.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-paper">{album.title}</span>
                  <span className="chart-label block truncate text-navy-300">
                    {album.category || "No category"} · {album.photoCount ?? album.photos.length}{" "}
                    photographs
                  </span>
                </Link>

                <span
                  className={`adm-pill ${album.status === "published" ? "adm-pill-live" : "adm-pill-draft"}`}
                >
                  {album.status === "published" ? "Live" : "Draft"}
                </span>

                <a
                  href={`/gallery/${album.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn adm-btn-sm"
                >
                  View
                </a>

                <MoveButtons
                  index={index}
                  total={albums.length}
                  moveUp={moveUp}
                  moveDown={moveDown}
                  label={album.title}
                />

                <ConfirmButton size="sm" confirmLabel="Delete album?" onConfirm={() => remove(album)}>
                  Delete
                </ConfirmButton>
              </div>
            )}
          />
        </Card>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New album"
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
            label="Album title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Annual Day 2026"
            autoFocus
          />
          <div>
            <TextInput
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Festivals"
              help="Albums are grouped under their category on the gallery page."
              list="album-categories"
            />
            <datalist id="album-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
