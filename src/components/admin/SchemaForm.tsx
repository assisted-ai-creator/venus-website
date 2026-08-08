"use client";

import { useState } from "react";
import type { Field } from "@/lib/sections/registry";
import { MediaField } from "./MediaPicker";
import { RichEditor } from "./RichEditor";
import { Button, ConfirmButton, MoveButtons, Sortable } from "./ui";

/**
 * Forms, generated from a field schema.
 *
 * Every editable block on the site declares its fields in
 * `lib/sections/registry.ts`; this renders them. That is what makes "change
 * anything on any page" tractable — a new field is one line in the registry,
 * not a new form written by hand, and the school never sees raw JSON.
 */

type Data = Record<string, unknown>;

const asString = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const asRows = (v: unknown): Data[] =>
  Array.isArray(v) ? v.filter((x): x is Data => !!x && typeof x === "object") : [];

/** `showWhen` lets a schema hide fields that do not apply to the chosen mode. */
function visible(field: Field, data: Data): boolean {
  if (!field.showWhen) return true;
  const current = asString(data[field.showWhen.field]);
  return field.showWhen.equals.includes(current);
}

export function SchemaForm({
  fields,
  value,
  onChange,
  className = "space-y-5",
}: {
  fields: Field[];
  value: Data;
  onChange: (next: Data) => void;
  className?: string;
}) {
  const set = (name: string, next: unknown) => onChange({ ...value, [name]: next });

  return (
    <div className={className}>
      {fields.filter((f) => visible(f, value)).map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={value[field.name]}
          onChange={(next) => set(field.name, next)}
        />
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <label className="block">
          <span className="adm-label">{field.label}</span>
          <textarea
            className="adm-textarea"
            rows={field.rows ?? 3}
            value={asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </label>
      );

    case "richtext":
      return (
        <div>
          <span className="adm-label">{field.label}</span>
          <RichEditor value={asString(value)} onChange={onChange} />
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </div>
      );

    case "number":
      return (
        <label className="block">
          <span className="adm-label">{field.label}</span>
          <input
            className="adm-input"
            type="number"
            value={typeof value === "number" ? value : asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          />
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </label>
      );

    case "boolean":
      return (
        <div>
          <label className="adm-switch">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="adm-switch-track" aria-hidden="true" />
            <span className="adm-label !mb-0">{field.label}</span>
          </label>
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </div>
      );

    case "select":
      return (
        <label className="block">
          <span className="adm-label">{field.label}</span>
          <select
            className="adm-select"
            value={asString(value) || field.options?.[0]?.value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </label>
      );

    case "media":
      return (
        <MediaField
          label={field.label}
          help={field.help}
          kind={field.kind ?? "image"}
          value={asString(value)}
          onChange={(mediaId) => onChange(mediaId)}
        />
      );

    case "group":
      return (
        <fieldset className="adm-card p-4">
          <legend className="adm-label px-1">{field.label}</legend>
          <SchemaForm
            fields={field.fields ?? []}
            value={(value as Data) ?? {}}
            onChange={(next) => onChange(next)}
          />
        </fieldset>
      );

    case "list":
      return <ListField field={field} value={asRows(value)} onChange={onChange} />;

    default:
      return (
        <label className="block">
          <span className="adm-label">{field.label}</span>
          <input
            className="adm-input"
            value={asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.help ? <p className="adm-help">{field.help}</p> : null}
        </label>
      );
  }
}

/* ------------------------------------------------------------ list field --- */

/**
 * Rows are identified by position, not by object identity: editing a field
 * replaces the row object, so an identity-based key would collapse the open
 * panel on every keystroke.
 */
function ListField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: Data[];
  onChange: (next: Data[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const children = field.fields ?? [];
  const labelKey = field.itemLabel ?? children[0]?.name ?? "";
  const atLimit = field.max !== undefined && value.length >= field.max;

  const titleOf = (row: Data, index: number) => {
    const raw = asString(row[labelKey]).trim();
    if (raw) return raw.length > 70 ? `${raw.slice(0, 69)}…` : raw;
    // Fall back to any filled field, so a row is never labelled "Entry 3" when
    // it plainly contains a name.
    for (const child of children) {
      const v = asString(row[child.name]).trim();
      if (v) return v.length > 70 ? `${v.slice(0, 69)}…` : v;
    }
    return `Entry ${index + 1}`;
  };

  const add = () => {
    const blank: Data = {};
    for (const child of children) blank[child.name] = child.type === "boolean" ? false : "";
    onChange([...value, blank]);
    setOpen(value.length);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="adm-label !mb-0">{field.label}</span>
        <Button size="sm" onClick={add} disabled={atLimit}>
          {field.addLabel ?? "Add"}
        </Button>
      </div>

      {field.help ? <p className="adm-help mb-2">{field.help}</p> : null}

      {value.length === 0 ? (
        <p className="border-2 border-dashed border-navy-700 px-3 py-4 text-center text-sm text-navy-300">
          Nothing here yet.
        </p>
      ) : (
        <Sortable
          items={value.map((row, i) => ({ row, key: String(i) }))}
          getKey={(entry) => entry.key}
          onReorder={(order) => onChange(order.map((k) => value[Number(k)]).filter(Boolean))}
          renderItem={({ row }, { index, moveUp, moveDown, dragHandle }) => {
            const isOpen = open === index;

            return (
              <div className="adm-card">
                <div className="flex items-center gap-2 p-2">
                  <span className="adm-grip" {...dragHandle} aria-hidden="true">
                    ⠿
                  </span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className="block truncate text-sm text-paper">{titleOf(row, index)}</span>
                  </button>
                  <MoveButtons
                    index={index}
                    total={value.length}
                    moveUp={moveUp}
                    moveDown={moveDown}
                    label={titleOf(row, index)}
                  />
                  <ConfirmButton
                    size="sm"
                    confirmLabel="Remove?"
                    onConfirm={() => {
                      setOpen(null);
                      onChange(value.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </ConfirmButton>
                </div>

                {isOpen ? (
                  <div className="border-t-2 border-navy-700 p-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {children.filter((c) => visible(c, row)).map((child) => (
                        <div
                          key={child.name}
                          className={child.width === "half" ? "" : "sm:col-span-2"}
                        >
                          <FieldRenderer
                            field={child}
                            value={row[child.name]}
                            onChange={(next) =>
                              onChange(
                                value.map((r, i) => (i === index ? { ...r, [child.name]: next } : r))
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
