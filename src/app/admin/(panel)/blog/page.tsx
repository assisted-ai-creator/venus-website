"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminPost } from "@/components/admin/api";
import { Button, Card, ConfirmButton, Empty, useToast } from "@/components/admin/ui";

export default function BlogScreen() {
  const router = useRouter();
  const { notify } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ posts: AdminPost[] }>("/blog");
      setPosts(res.posts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      const res = await api.post<{ id: string }>("/blog", { title: "Untitled post", status: "draft" });
      router.push(`/admin/blog/${res.id}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The post could not be created.", "error");
      setCreating(false);
    }
  };

  const remove = async (post: AdminPost) => {
    try {
      await api.del(`/blog/${post.id}`);
      notify(`“${post.title}” deleted.`);
      load();
    } catch {
      notify("The post could not be deleted.", "error");
    }
  };

  const drafts = posts.filter((p) => p.status === "draft");
  const live = posts.filter((p) => p.status === "published");

  const Row = ({ post }: { post: AdminPost }) => (
    <div className="adm-row">
      <span className="h-12 w-16 flex-none overflow-hidden border-2 border-navy-700 bg-navy-900">
        {post.cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={post.cover} alt="" className="h-full w-full object-cover" />
        ) : null}
      </span>

      <Link href={`/admin/blog/${post.id}`} className="min-w-0 flex-1">
        <span className="block truncate text-paper">{post.title}</span>
        <span className="chart-label block truncate text-navy-300">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Not published"}
          {post.author ? ` · ${post.author}` : ""}
          {post.tags.length ? ` · ${post.tags.join(", ")}` : ""}
        </span>
      </Link>

      <span className={`adm-pill ${post.status === "published" ? "adm-pill-live" : "adm-pill-draft"}`}>
        {post.status === "published" ? "Live" : "Draft"}
      </span>

      {post.status === "published" ? (
        <a
          href={`/blog/${post.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn adm-btn-sm"
        >
          View
        </a>
      ) : null}

      <ConfirmButton size="sm" confirmLabel="Delete post?" onConfirm={() => remove(post)}>
        Delete
      </ConfirmButton>
    </div>
  );

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Blog"
        description="Notices, reports and features. Drafts stay invisible to visitors until you publish them."
        actions={
          <Button variant="primary" onClick={create} disabled={creating}>
            {creating ? "Creating…" : "Write a post"}
          </Button>
        }
      />

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <div className="space-y-5">
          {drafts.length ? (
            <Card title={`${drafts.length} drafts`} bodyClassName="space-y-2 p-3">
              {drafts.map((p) => (
                <Row key={p.id} post={p} />
              ))}
            </Card>
          ) : null}

          <Card title={`${live.length} published`} bodyClassName="space-y-2 p-3">
            {live.length === 0 ? (
              <Empty>Nothing published yet.</Empty>
            ) : (
              live.map((p) => <Row key={p.id} post={p} />)
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
