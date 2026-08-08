"use client";

import { useCallback, useEffect, useState } from "react";
import { ScreenHeader } from "@/components/admin/AdminShell";
import { api, type Enquiry } from "@/components/admin/api";
import { Button, Card, Empty, Select, useToast } from "@/components/admin/ui";

export default function EnquiriesScreen() {
  const { notify } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState("open");
  const [counts, setCounts] = useState({ total: 0, open: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ enquiries: Enquiry[]; total: number; open: number }>(
        `/enquiries?status=${filter}`
      );
      setEnquiries(res.enquiries);
      setCounts({ total: res.total, open: res.open });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setHandled = async (id: number, handled: boolean) => {
    setEnquiries((list) => list.map((e) => (e.id === id ? { ...e, handled } : e)));
    try {
      await api.patch(`/enquiries/${id}`, { handled });
    } catch {
      notify("That could not be saved.", "error");
      load();
    }
  };

  return (
    <div className="adm-body">
      <ScreenHeader
        title="Enquiries"
        description={`${counts.open} waiting, ${counts.total} in total. These arrive from the enquiry form on the website.`}
        actions={
          <>
            <Select
              value={filter}
              options={[
                { value: "open", label: "Waiting" },
                { value: "handled", label: "Dealt with" },
                { value: "all", label: "Everything" },
              ]}
              onChange={(e) => setFilter(e.target.value)}
            />
            <a href="/api/admin/enquiries/export.csv" className="adm-btn" download>
              Download CSV
            </a>
          </>
        }
      />

      {loading ? (
        <p className="chart-label text-navy-300">Loading…</p>
      ) : enquiries.length === 0 ? (
        <Card>
          <Empty>
            {filter === "open" ? "Nothing waiting — every enquiry has been dealt with." : "Nothing here."}
          </Empty>
        </Card>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li key={e.id}>
              <Card
                title={`${e.parentName} · ${e.seekingClass}`}
                actions={
                  <>
                    <span className={`adm-pill ${e.handled ? "adm-pill-off" : "adm-pill-draft"}`}>
                      {e.handled ? "Dealt with" : "Waiting"}
                    </span>
                    <Button size="sm" onClick={() => setHandled(e.id, !e.handled)}>
                      {e.handled ? "Reopen" : "Mark dealt with"}
                    </Button>
                  </>
                }
              >
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="chart-label text-navy-300">Telephone</dt>
                    <dd>
                      <a href={`tel:${e.phone}`} className="tabular text-paper underline">
                        {e.phone}
                      </a>
                    </dd>
                  </div>
                  {e.email ? (
                    <div>
                      <dt className="chart-label text-navy-300">Email</dt>
                      <dd>
                        <a href={`mailto:${e.email}`} className="break-all text-paper underline">
                          {e.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {e.childName ? (
                    <div>
                      <dt className="chart-label text-navy-300">Child</dt>
                      <dd className="text-paper">{e.childName}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="chart-label text-navy-300">Received</dt>
                    <dd className="tabular text-paper">
                      {new Date(e.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                </dl>

                {e.message ? (
                  <p className="mt-4 border-t-2 border-navy-700 pt-3 text-sm text-navy-100">
                    {e.message}
                  </p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
