"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, ApiError, type AdminUser } from "@/components/admin/api";
import { Button, Card, Note, TextInput, useToast } from "@/components/admin/ui";

export default function AccountScreen() {
  const { notify } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ user: AdminUser }>("/me")
      .then((r) => setUser(r.user))
      .catch(() => {});
  }, []);

  const change = async () => {
    if (next !== confirm) {
      notify("The two new passwords do not match.", "error");
      return;
    }
    setBusy(true);
    try {
      await api.post("/password", { current, next });
      notify("Password changed. Any other sessions have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "The password could not be changed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader title="Your account" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Signed in as">
          {user ? (
            <dl className="space-y-3">
              <div>
                <dt className="chart-label text-navy-300">Name</dt>
                <dd className="text-paper">{user.name}</dd>
              </div>
              <div>
                <dt className="chart-label text-navy-300">Email</dt>
                <dd className="break-all text-paper">{user.email}</dd>
              </div>
              <div>
                <dt className="chart-label text-navy-300">Role</dt>
                <dd className="text-paper">
                  {user.role === "owner"
                    ? "Owner — content, accounts and access"
                    : "Editor — content only"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="chart-label text-navy-300">Loading…</p>
          )}
        </Card>

        <Card title="Change your password">
          <div className="space-y-4">
            <TextInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <TextInput
              label="New password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              help="At least ten characters."
            />
            <TextInput
              label="New password again"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {next && confirm && next !== confirm ? (
              <Note tone="error">The two new passwords do not match.</Note>
            ) : null}
            <Button
              variant="primary"
              onClick={change}
              disabled={busy || !current || next.length < 10 || next !== confirm}
            >
              {busy ? "Changing…" : "Change password"}
            </Button>
            <p className="adm-help">
              Changing your password signs out every other device using this account.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
