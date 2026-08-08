"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError } from "@/components/admin/api";
import { SchemaForm } from "@/components/admin/SchemaForm";
import { Button, Card, Note, useToast } from "@/components/admin/ui";
import { DOCUMENTS, fromForm, toForm } from "@/lib/sections/documents";

export default function SettingsScreen() {
  const { notify } = useToast();
  const [active, setActive] = useState(DOCUMENTS[0].key);
  const [values, setValues] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ settings: Record<string, unknown> }>("/settings")
      .then((res) => {
        const next: Record<string, Record<string, unknown>> = {};
        for (const doc of DOCUMENTS) next[doc.key] = toForm(doc.key, res.settings[doc.key]);
        setValues(next);
      })
      .catch(() => notify("Settings could not be loaded.", "error"))
      .finally(() => setLoading(false));
  }, [notify]);

  const doc = DOCUMENTS.find((d) => d.key === active)!;

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/settings/${active}`, fromForm(active, values[active] ?? {}));
      notify("Saved. The change is live across the website.");
      setDirty((d) => ({ ...d, [active]: false }));
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="School details"
        description="The facts the whole site draws on. Change a telephone number here and it changes in the header, the contact page, the footer and the data search engines read — all at once."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {DOCUMENTS.map((d) => (
          <button
            key={d.key}
            type="button"
            className="adm-nav-link"
            aria-current={active === d.key ? "page" : undefined}
            onClick={() => setActive(d.key)}
          >
            {d.name}
            {dirty[d.key] ? " •" : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : (
        <Card title={doc.name}>
          <p className="mb-5 text-sm text-navy-300">{doc.description}</p>

          {dirty[active] ? (
            <div className="mb-5">
              <Note tone="warn">You have unsaved changes on this tab.</Note>
            </div>
          ) : null}

          <SchemaForm
            fields={doc.fields}
            value={values[active] ?? {}}
            onChange={(next) => {
              setValues((v) => ({ ...v, [active]: next }));
              setDirty((d) => ({ ...d, [active]: true }));
            }}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t-2 border-navy-700 pt-4">
            <Button variant="primary" onClick={save} disabled={saving || !dirty[active]}>
              {saving ? "Saving…" : dirty[active] ? "Save changes" : "Saved"}
            </Button>
            <span className="text-sm text-navy-300">
              {dirty[active]
                ? "Nothing is live until you save."
                : "Everything here is live on the website."}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
