import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getSite } from "@/lib/content";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/chart/Icon";
import { RichBody, Img } from "@/components/sections/parts";
import { articleSchema } from "@/lib/seo";

interface Params {
  params: Promise<{ slug: string }>;
}

const readable = (at: number | null) =>
  at
    ? new Date(at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || post.subtitle,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPost(slug), getSite()]);
  if (!post) notFound();

  const others = site.posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const meta = [
    ...(post.publishedAt ? [{ label: "Published", value: readable(post.publishedAt) }] : []),
    ...(post.author ? [{ label: "By", value: post.author }] : []),
    ...(post.tags.length ? [{ label: "Filed under", value: post.tags.join(" · ") }] : []),
  ];

  return (
    <>
      <PageHeader
        title={post.title}
        standfirst={post.subtitle || post.excerpt}
        trail={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
        meta={meta}
      />

      <section className="wall">
        <div className="shell band">
          <article className="mx-auto max-w-3xl">
            {post.cover ? (
              <figure className="mb-12 overflow-hidden bg-image-bed">
                <Img
                  src={post.cover}
                  alt={post.coverAlt || post.title}
                  width={1600}
                  height={900}
                  priority
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            ) : null}

            <RichBody html={post.bodyHtml} className="max-w-none" />
          </article>

          {others.length ? (
            <nav aria-label="More posts" className="mt-[clamp(3rem,6vw,5rem)] border-t-2 border-ink pt-8">
              <h2 className="chart-label mb-6 on-ground-accent">More from the school</h2>
              <ul className="grid gap-x-10 sm:grid-cols-3">
                {others.map((p) => (
                  <li key={p.slug} className="border-t border-paper-shade">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group block py-4 on-ground transition-colors hover-accent"
                    >
                      <span className="chart-label tabular block on-ground-faint">
                        {readable(p.publishedAt)}
                      </span>
                      <span className="display-sm mt-1.5 block text-[1.08rem]">{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <p className="mt-10">
            <Link href="/blog" className="btn btn-ghost">
              <Icon name="chevron" size={12} className="rotate-180" />
              All posts
            </Link>
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema(site.settings.school.siteUrl, site.settings.school.name, post)
          ),
        }}
      />
    </>
  );
}
