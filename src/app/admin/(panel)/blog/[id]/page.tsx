"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminPost } from "@/components/admin/api";
import { MediaField } from "@/components/admin/MediaPicker";
import { RichEditor } from "@/components/admin/RichEditor";
import {
  Button,
  Card,
  ConfirmButton,
  Note,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();

  const [post, setPost] = useState<AdminPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    bodyHtml: "",
    author: "",
    tags: "",
    coverMediaId: "",
    seoTitle: "",
    seoDescription: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<{ post: AdminPost }>(`/blog/${id}`);
    setPost(res.post);
    setForm({
      title: res.post.title,
      slug: res.post.slug,
      subtitle: res.post.subtitle,
      excerpt: res.post.excerpt,
      bodyHtml: res.post.bodyHtml ?? "",
      author: res.post.author,
      tags: res.post.tags.join(", "),
      coverMediaId: res.post.coverMediaId ?? "",
      seoTitle: String(res.post.seo?.title ?? ""),
      seoDescription: String(res.post.seo?.description ?? ""),
    });
    setDirty(false);
  }, [id]);

  useEffect(() => {
    load().catch(() => notify("This post could not be loaded.", "error"));
  }, [load, notify]);

  const change = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const save = async (status?: "draft" | "published") => {
    setSaving(true);
    try {
      await api.patch(`/blog/${id}`, {
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle,
        excerpt: form.excerpt,
        bodyHtml: form.bodyHtml,
        author: form.author,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        coverMediaId: form.coverMediaId || null,
        seo: {
          title: form.seoTitle || undefined,
          description: form.seoDescription || undefined,
        },
        ...(status ? { status } : {}),
      });
      notify(
        status === "published"
          ? "Published. The post is live on the website."
          : status === "draft"
            ? "Moved back to drafts and taken off the website."
            : "Saved."
      );
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.del(`/blog/${id}`);
      notify("Post deleted.");
      router.push("/admin/blog");
    } catch {
      notify("The post could not be deleted.", "error");
    }
  };

  if (!post) {
    return (
      <div className="adm-body">
        <p className="chart-label text-navy-300">Loading…</p>
      </div>
    );
  }

  return (
    <div className="adm-body max-w-none">
      <ScreenHeader
        title={form.title || "Untitled post"}
        description={post.status === "published" ? `/blog/${post.slug}` : "Draft — not on the website"}
        actions={
          <>
            <Link href="/admin/blog" className="adm-btn">
              All posts
            </Link>
            {post.status === "published" ? (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn"
              >
                View post
              </a>
            ) : null}
            <Button onClick={() => save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            {post.status === "published" ? (
              <Button onClick={() => save("draft")} disabled={saving}>
                Unpublish
              </Button>
            ) : (
              <Button variant="primary" onClick={() => save("published")} disabled={saving}>
                Publish
              </Button>
            )}
          </>
        }
      />

      {dirty ? (
        <div className="mb-4">
          <Note tone="warn">You have unsaved changes.</Note>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Card title="The post">
            <div className="space-y-4">
              <TextInput
                label="Title"
                value={form.title}
                onChange={(e) => change({ title: e.target.value })}
              />
              <TextInput
                label="Sub-heading"
                value={form.subtitle}
                onChange={(e) => change({ subtitle: e.target.value })}
                help="Printed under the title at the top of the post."
              />
            </div>
          </Card>

          <div>
            <span className="adm-label">Body</span>
            <RichEditor
              value={form.bodyHtml}
              onChange={(html) => change({ bodyHtml: html })}
              placeholder="Write the post. Use the toolbar for headings, bold, italics, lists, photographs and films."
            />
            <p className="adm-help">
              Photographs come from the library, so they carry the alt text you wrote there. Films are
              embedded from YouTube in privacy-enhanced mode.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Card title="Publishing">
            <div className="space-y-4">
              <p className="text-sm text-navy-200">
                Status:{" "}
                <span className={post.status === "published" ? "text-[#7ee0b0]" : "text-saffron"}>
                  {post.status === "published" ? "Published" : "Draft"}
                </span>
                {post.publishedAt ? (
                  <>
                    {" "}
                    ·{" "}
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </>
                ) : null}
              </p>
              <TextInput
                label="Web address"
                value={form.slug}
                onChange={(e) => change({ slug: e.target.value })}
                help={`/blog/${form.slug || "…"}`}
              />
              <TextInput
                label="Author"
                value={form.author}
                onChange={(e) => change({ author: e.target.value })}
              />
              <TextInput
                label="Tags"
                value={form.tags}
                onChange={(e) => change({ tags: e.target.value })}
                help="Separate with commas. A blog block on a page can show only one tag."
              />
              <ConfirmButton confirmLabel="Delete this post?" onConfirm={remove}>
                Delete post
              </ConfirmButton>
            </div>
          </Card>

          <Card title="Cover photograph">
            <MediaField
              value={form.coverMediaId}
              onChange={(mediaId) => change({ coverMediaId: mediaId })}
              help="Used on the blog index, in the sharing preview and at the top of the post."
            />
          </Card>

          <Card title="Summary and search">
            <div className="space-y-4">
              <TextArea
                label="Summary"
                rows={3}
                value={form.excerpt}
                onChange={(e) => change({ excerpt: e.target.value })}
                help="Shown on the blog index. Left empty, the opening of the post is used."
              />
              <TextInput
                label="Search-result title"
                value={form.seoTitle}
                onChange={(e) => change({ seoTitle: e.target.value })}
              />
              <TextArea
                label="Search-result description"
                rows={2}
                value={form.seoDescription}
                onChange={(e) => change({ seoDescription: e.target.value })}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
