"use client";

import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminUser, type IpPolicy } from "@/components/admin/api";
import {
  Button,
  Card,
  ConfirmButton,
  Dialog,
  Note,
  Select,
  Switch,
  TextArea,
  TextInput,
  useToast,
} from "@/components/admin/ui";

interface WhoAmI {
  ip: string;
  policy: IpPolicy;
  allowed: boolean;
}

/**
 * Who may reach /admin.
 *
 * The gate ships off, so every address can reach the panel until the school
 * decides otherwise. Turning it on without your own address in the list is the
 * one mistake that cannot be undone from inside the panel, so the screen shows
 * your address, refuses the save, and makes you confirm deliberately.
 */
export default function SecurityScreen() {
  const { notify } = useToast();
  const [me, setMe] = useState<WhoAmI | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [testIp, setTestIp] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    const who = await api.get<WhoAmI>("/settings/security/whoami");
    setMe(who);
    setEnabled(who.policy.enabled);
    setEntries(who.policy.allow.filter((e) => e !== "*"));
    setNote(who.policy.note ?? "");
    setDirty(false);
  }, []);

  useEffect(() => {
    load().catch(() => notify("The access policy could not be loaded.", "error"));
  }, [load, notify]);

  const save = async (confirmLockout = false) => {
    setSaving(true);
    try {
      const allow = entries.map((e) => e.trim()).filter(Boolean);
      await api.put("/settings/security", {
        enabled,
        allow: enabled ? allow : ["*"],
        note,
        confirmLockout,
      });
      notify(enabled ? "The gate is on. Only the listed addresses can reach the panel." : "The gate is off. Every address can reach the panel.");
      setConfirming(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConfirming(err.message);
      } else {
        notify(err instanceof ApiError ? err.message : "That could not be saved.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!testIp.trim()) return;
    try {
      const res = await api.post<{ allowed: boolean }>("/settings/security/test", { ip: testIp.trim() });
      setTestResult(
        res.allowed
          ? `${testIp.trim()} would reach the panel.`
          : `${testIp.trim()} would be blocked.`
      );
    } catch {
      setTestResult("That address could not be checked.");
    }
  };

  const addMine = () => {
    if (!me?.ip || entries.includes(me.ip)) return;
    setEntries([...entries, me.ip]);
    setDirty(true);
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Access & IPs"
        description="Restrict /admin to particular internet addresses. This sits in front of the password — it does not replace it."
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card title="The gate">
            <div className="space-y-5">
              <Switch
                checked={enabled}
                label={enabled ? "Only the listed addresses may reach /admin" : "Every address may reach /admin"}
                help={
                  enabled
                    ? "A request from any other address is refused before the sign-in screen loads."
                    : "This is how the site ships. Turn it on once you know which addresses the school edits from."
                }
                onChange={(v) => {
                  setEnabled(v);
                  setDirty(true);
                }}
              />

              {enabled ? (
                <>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="adm-label !mb-0">Permitted addresses</span>
                      <span className="flex gap-2">
                        <Button size="sm" onClick={addMine} disabled={!me?.ip || entries.includes(me.ip)}>
                          Add my address
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEntries([...entries, ""]);
                            setDirty(true);
                          }}
                        >
                          Add an entry
                        </Button>
                      </span>
                    </div>

                    {entries.length === 0 ? (
                      <Note tone="warn">
                        The list is empty. An empty list is treated as “everyone”, so the gate would
                        have no effect — add at least your own address.
                      </Note>
                    ) : (
                      <ul className="space-y-2">
                        {entries.map((entry, i) => (
                          <li key={i} className="flex gap-2">
                            <input
                              className="adm-input"
                              value={entry}
                              placeholder="203.0.113.9, 203.0.113.0/24 or 203.0.113.*"
                              onChange={(e) => {
                                setEntries(entries.map((x, n) => (n === i ? e.target.value : x)));
                                setDirty(true);
                              }}
                            />
                            {me?.ip && entry.trim() === me.ip ? (
                              <span className="adm-pill adm-pill-live self-center">Yours</span>
                            ) : null}
                            <Button
                              size="sm"
                              onClick={() => {
                                setEntries(entries.filter((_, n) => n !== i));
                                setDirty(true);
                              }}
                              aria-label={`Remove ${entry || "entry"}`}
                            >
                              ✕
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="adm-help">
                      One address per line. A single address (203.0.113.9), a range in CIDR form
                      (203.0.113.0/24), or a wildcard (203.0.113.*). IPv6 is accepted in both forms.
                    </p>
                  </div>

                  <TextArea
                    label="Note"
                    rows={2}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setDirty(true);
                    }}
                    help="For whoever reads this next — which office or connection each range belongs to."
                  />
                </>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 border-t-2 border-navy-700 pt-4">
                <Button variant="primary" onClick={() => save(false)} disabled={saving || !dirty}>
                  {saving ? "Saving…" : dirty ? "Save access rules" : "Saved"}
                </Button>
                {dirty ? <span className="text-sm text-saffron">Unsaved changes</span> : null}
              </div>
            </div>
          </Card>

          <Card title="Test an address">
            <div className="flex flex-wrap gap-2">
              <TextInput
                className="min-w-[14rem] flex-1"
                value={testIp}
                onChange={(e) => setTestIp(e.target.value)}
                placeholder="203.0.113.9"
                aria-label="Address to test"
              />
              <Button onClick={test} className="self-end">
                Check
              </Button>
            </div>
            {testResult ? <p className="mt-3 text-sm text-navy-100">{testResult}</p> : null}
            <p className="adm-help">Checked against the rules as they are currently saved.</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="This connection">
            {me ? (
              <>
                <p className="chart-label text-navy-300">Your address</p>
                <p className="display tabular mt-1 break-all text-2xl text-paper">{me.ip || "unknown"}</p>
                <p className="mt-3 text-sm text-navy-200">
                  {me.allowed
                    ? "The rules as saved would let you in."
                    : "The rules as saved would block you."}
                </p>
                <p className="adm-help">
                  A home broadband address usually changes from time to time. If the school edits from
                  home, use a range rather than a single address, or leave the gate off.
                </p>
              </>
            ) : (
              <p className="chart-label text-navy-300">Loading…</p>
            )}
          </Card>

          <Card title="If you lock yourself out">
            <p className="text-sm text-navy-200">
              The rule is stored in the content database, not in code. Whoever manages the Cloudflare
              account can clear it with:
            </p>
            <pre className="mt-3 overflow-x-auto border-2 border-navy-700 bg-navy-900 p-3 text-xs text-navy-100">
{`wrangler d1 execute venus-cms --remote \\
  --command "DELETE FROM settings WHERE key='security'"`}
            </pre>
            <p className="adm-help">
              The gate also stands down on its own if the content API cannot be reached, so an
              outage never becomes a lockout.
            </p>
          </Card>

          <Accounts />
        </div>
      </div>

      <Dialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="This would lock you out"
        size="sm"
        footer={
          <>
            <Button onClick={() => setConfirming(null)}>Go back and fix it</Button>
            <Button variant="danger" onClick={() => save(true)} disabled={saving}>
              Save anyway
            </Button>
          </>
        }
      >
        <Note tone="error">{confirming}</Note>
        <p className="mt-3 text-sm text-navy-200">
          Add your own address to the list, or leave the gate off. If you save anyway, the only way
          back in is the Cloudflare command shown on this screen.
        </p>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------- accounts --- */

function Accounts() {
  const { notify } = useToast();
  const [users, setUsers] = useState<(AdminUser & { lastLoginAt: number | null })[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ users: (AdminUser & { lastLoginAt: number | null })[] }>("/users");
      setUsers(res.users);
    } catch {
      /* Editors cannot read this list. */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setBusy(true);
    try {
      await api.post("/users", form);
      notify("Account created.");
      setAdding(false);
      setForm({ name: "", email: "", password: "", role: "editor" });
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The account could not be created.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/users/${id}`);
      notify("Account removed.");
      await load();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The account could not be removed.", "error");
    }
  };

  return (
    <>
      <Card
        title="Accounts"
        actions={
          <Button size="sm" onClick={() => setAdding(true)}>
            Add
          </Button>
        }
      >
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-paper">{u.name}</span>
                <span className="chart-label block truncate text-navy-300">
                  {u.email} · {u.role}
                </span>
              </span>
              <ConfirmButton size="sm" confirmLabel="Remove?" onConfirm={() => remove(u.id)}>
                Remove
              </ConfirmButton>
            </li>
          ))}
        </ul>
        <p className="adm-help">
          An owner can manage accounts and the IP gate. An editor can change content only.
        </p>
      </Card>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add an account"
        size="sm"
        footer={
          <>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            help="At least ten characters. They can change it after signing in."
          />
          <Select
            label="Role"
            value={form.role}
            options={[
              { value: "editor", label: "Editor — content only" },
              { value: "owner", label: "Owner — content, accounts and access" },
            ]}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
      </Dialog>
    </>
  );
}
