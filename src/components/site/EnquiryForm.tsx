"use client";

import { useId, useState } from "react";
import { CLASS_OPTIONS, enquirySchema } from "@/lib/enquiry";
import { Icon } from "@/components/chart/Icon";
import { school } from "@/content/school";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The enquiry slip. Validates on the client for a fast answer, and the server
 * re-validates with the same schema.
 */
export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const f = (name: string) => `${uid}-${name}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      parentName: String(fd.get("parentName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      childName: String(fd.get("childName") ?? ""),
      seekingClass: String(fd.get("seekingClass") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      setStatus("error");
      setFormError("Some details need checking before this can be sent.");
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json()) as {
        ok: boolean;
        message?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!res.ok || !body.ok) {
        setErrors(body.fieldErrors ?? {});
        setFormError(
          body.message ??
            `Something went wrong. Please call ${school.phones[1].number}.`
        );
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setFormError(
        `The enquiry could not be sent — please check your connection, or call ${school.phones[1].number}.`
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-l-[3px] border-verify bg-verify-wash px-5 py-6">
        <p className="chart-label text-verify">Enquiry received</p>
        <h3 className="display mt-3 text-[1.5rem] leading-[1.25] text-ink">
          Thank you — the office will telephone you back.
        </h3>
        <p className="mt-3 text-[0.97rem] leading-[1.7] text-ink-soft">
          The school office will contact you on the number you gave. Office hours are{" "}
          {school.hours[0].days}, {school.hours[0].time}.
        </p>
        <a
          href={school.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ink mt-6"
        >
          Continue to registration
          <Icon name="arrow" size={14} />
        </a>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={f(`${k}-err`)} className="mt-2 text-sm font-medium text-alert">
        {errors[k]}
      </p>
    ) : null;

  const aria = (k: string) => ({
    "aria-invalid": errors[k] ? ("true" as const) : undefined,
    "aria-describedby": errors[k] ? f(`${k}-err`) : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError ? (
        <div
          role="alert"
          className="mb-6 border-l-[3px] border-alert bg-[#fdf2f0] px-4 py-3.5 text-sm font-medium text-alert"
        >
          {formError}
        </div>
      ) : null}

      {/*
        The columns are measured against the form, not the viewport: the slip
        is set in a half-width column on Contact and full width on Admissions,
        and a viewport-driven `sm:grid-cols-2` would put two 14ch fields side
        by side in the narrow case.
      */}
      <div
        className={`grid gap-5 ${
          compact ? "" : "[grid-template-columns:repeat(auto-fit,minmax(min(100%,13.75rem),1fr))]"
        }`}
      >
        <div className={compact ? "" : "[grid-column:1/-1]"}>
          <label htmlFor={f("parentName")} className="chart-label mb-2 block on-ground-faint">
            Parent or guardian <span className="text-alert">*</span>
          </label>
          <input
            id={f("parentName")}
            name="parentName"
            className="field"
            autoComplete="name"
            required
            {...aria("parentName")}
          />
          {err("parentName")}
        </div>

        <div>
          <label htmlFor={f("phone")} className="chart-label mb-2 block on-ground-faint">
            Phone <span className="text-alert">*</span>
          </label>
          <input
            id={f("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            className="field"
            autoComplete="tel"
            // Not the school's own number — that reads as a prefilled value.
            placeholder="Your 10-digit mobile number"
            required
            {...aria("phone")}
          />
          {err("phone")}
        </div>

        <div>
          <label htmlFor={f("email")} className="chart-label mb-2 block on-ground-faint">
            Email
          </label>
          <input
            id={f("email")}
            name="email"
            type="email"
            className="field"
            autoComplete="email"
            placeholder="name@example.com"
            {...aria("email")}
          />
          {err("email")}
        </div>

        <div>
          <label htmlFor={f("childName")} className="chart-label mb-2 block on-ground-faint">
            Child&rsquo;s name
          </label>
          <input id={f("childName")} name="childName" className="field" {...aria("childName")} />
          {err("childName")}
        </div>

        <div>
          <label htmlFor={f("seekingClass")} className="chart-label mb-2 block on-ground-faint">
            Class applied for <span className="text-alert">*</span>
          </label>
          <select
            id={f("seekingClass")}
            name="seekingClass"
            className="field"
            defaultValue=""
            required
            {...aria("seekingClass")}
          >
            <option value="" disabled>
              Choose a class
            </option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {err("seekingClass")}
        </div>

        <div className={compact ? "" : "[grid-column:1/-1]"}>
          <label htmlFor={f("message")} className="chart-label mb-2 block on-ground-faint">
            Your question
          </label>
          <textarea
            id={f("message")}
            name="message"
            rows={compact ? 3 : 4}
            className="field resize-y"
            placeholder="Transport, fees, a campus visit — anything you would like to ask."
            {...aria("message")}
          />
          {err("message")}
        </div>
      </div>

      {/* Honeypot. Hidden from sighted users and from assistive technology. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={f("website")}>Leave this field empty</label>
        <input id={f("website")} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
          {status === "sending" ? null : <Icon name="arrow" size={14} />}
        </button>
        <p className="max-w-[34ch] text-sm leading-[1.6] text-ink-faint">
          We use your number only to answer this enquiry. Or call{" "}
          <a href={school.phones[1].href} className="tabular font-semibold text-navy-700">
            {school.phones[1].number}
          </a>
        </p>
      </div>
      <p aria-live="polite" className="sr-only">
        {status === "sending" ? "Sending your enquiry" : ""}
      </p>
    </form>
  );
}
