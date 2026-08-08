"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extension-placeholder";
import { MediaPicker } from "./MediaPicker";
import { Button, Dialog } from "./ui";

/**
 * The writing surface.
 *
 * Headings and sub-headings, bold, italic, underline, strike, quotes, lists,
 * alignment, links, rules, photographs from the library and YouTube films
 * placed anywhere in the flow. It emits HTML, which the API re-parses and
 * sanitises before storing, so nothing the browser produces is trusted.
 */

interface ToolProps {
  editor: Editor;
  onPickImage: () => void;
  onAddVideo: () => void;
  onAddLink: () => void;
}

function Toolbar({ editor, onPickImage, onAddVideo, onAddLink }: ToolProps) {
  // Re-render on every selection change so the pressed states stay honest.
  const [, force] = useState(0);
  useEffect(() => {
    const bump = () => force((n) => n + 1);
    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);
    return () => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    };
  }, [editor]);

  const Tool = ({
    label,
    title,
    active,
    onClick,
    disabled,
  }: {
    label: string;
    title: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      className="adm-tool"
      title={title}
      aria-label={title}
      aria-pressed={active ?? false}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="adm-editor-bar">
      <Tool
        label="H2"
        title="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <Tool
        label="H3"
        title="Sub-heading"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <Tool
        label="H4"
        title="Small heading"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      />
      <Tool
        label="¶"
        title="Body text"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      />

      <span className="adm-tool-sep" aria-hidden="true" />

      <Tool
        label="B"
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Tool
        label="I"
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Tool
        label="U"
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Tool
        label="S"
        title="Strike-through"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Tool
        label="</>"
        title="Code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <span className="adm-tool-sep" aria-hidden="true" />

      <Tool
        label="• List"
        title="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Tool
        label="1. List"
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Tool
        label="❝"
        title="Quotation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <Tool label="—" title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />

      <span className="adm-tool-sep" aria-hidden="true" />

      <Tool
        label="⇤"
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <Tool
        label="↔"
        title="Align centre"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <Tool
        label="⇥"
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />

      <span className="adm-tool-sep" aria-hidden="true" />

      <Tool label="Link" title="Add or edit a link" active={editor.isActive("link")} onClick={onAddLink} />
      <Tool label="Photo" title="Insert a photograph" onClick={onPickImage} />
      <Tool label="Video" title="Insert a YouTube film" onClick={onAddVideo} />

      <span className="adm-tool-sep" aria-hidden="true" />

      <Tool
        label="↺"
        title="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <Tool
        label="↻"
        title="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
      <Tool
        label="Clear"
        title="Remove formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      />
    </div>
  );
}

export function RichEditor({
  value,
  onChange,
  placeholder = "Write here…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [pickingImage, setPickingImage] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Image.configure({ inline: false, HTMLAttributes: { loading: "lazy", decoding: "async" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ nocookie: true, width: 960, height: 540, modestBranding: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "rich", spellcheck: "true" } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Loading a different post into the same mounted editor must replace the
  // document rather than append to it.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // Deliberately keyed on `value` alone: reacting to `editor` would reset the
    // document on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return (
      <div className="adm-editor">
        <div className="p-6 text-sm text-ink-soft">Loading the editor…</div>
      </div>
    );
  }

  return (
    <div className="adm-editor">
      <Toolbar
        editor={editor}
        onPickImage={() => setPickingImage(true)}
        onAddVideo={() => {
          setVideoUrl("");
          setVideoOpen(true);
        }}
        onAddLink={() => {
          setLinkUrl(editor.getAttributes("link").href ?? "");
          setLinkOpen(true);
        }}
      />

      <EditorContent editor={editor} />

      <MediaPicker
        open={pickingImage}
        onClose={() => setPickingImage(false)}
        kind="image"
        title="Insert a photograph"
        onPick={(items) => {
          const m = items[0];
          if (!m) return;
          editor.chain().focus().setImage({ src: m.url, alt: m.alt, title: m.caption || undefined }).run();
        }}
      />

      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="Insert a YouTube film"
        size="sm"
        footer={
          <>
            <Button onClick={() => setVideoOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (videoUrl.trim()) {
                  editor.commands.setYoutubeVideo({ src: videoUrl.trim(), width: 960, height: 540 });
                }
                setVideoOpen(false);
              }}
            >
              Insert
            </Button>
          </>
        }
      >
        <label className="adm-label" htmlFor="yt-url">
          YouTube address
        </label>
        <input
          id="yt-url"
          className="adm-input"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <p className="adm-help">
          Paste the full address from the browser. The film is embedded in privacy-enhanced mode.
        </p>
      </Dialog>

      <Dialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Link"
        size="sm"
        footer={
          <>
            <Button
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Remove link
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const href = linkUrl.trim();
                if (href) {
                  editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
                }
                setLinkOpen(false);
              }}
            >
              Save link
            </Button>
          </>
        }
      >
        <label className="adm-label" htmlFor="link-url">
          Links to
        </label>
        <input
          id="link-url"
          className="adm-input"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="/admissions or https://…"
        />
        <p className="adm-help">
          Select the words first, then set the address. Use a path such as /admissions for a page on
          this site.
        </p>
      </Dialog>
    </div>
  );
}
