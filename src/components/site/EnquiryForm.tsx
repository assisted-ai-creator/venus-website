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
      <div className="p-6 text-center sm:p-10">
        <span className="callout-num callout-num-filled mx-auto !h-12 !w-12 !text-lg">
          <Icon name="check" size={22} />
        </span>
        <h3 className="display mt-5 text-2xl">Enquiry received</h3>
        <p className="prose-chart mx-auto mt-3">
          The school office will contact you on the number you gave. Office hours
          are {school.hours[0].days}, {school.hours[0].time}.
        </p>
        <p className="mt-5">
          <a
            href={school.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ink"
          >
            Continue to registration
            <Icon name="arrow" size={15} />
          </a>
        </p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={f(`${k}-err`)} className="mt-1.5 text-sm font-semibold text-alert">
        {errors[k]}
      </p>
    ) : null;

  const aria = (k: string) => ({
    "aria-invalid": errors[k] ? ("true" as const) : undefined,
    "aria-describedby": errors[k] ? f(`${k}-err`) : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="p-5 sm:p-7">
      {formError ? (
        <div
          role="alert"
          className="mb-5 border-2 border-alert bg-[#fdf2f0] px-4 py-3 text-sm font-semibold text-alert"
        >
          {formError}
        </div>
      ) : null}

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor={f("parentName")} className="chart-label mb-1.5 block">
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
          <label htmlFor={f("phone")} className="chart-label mb-1.5 block">
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
          <label htmlFor={f("email")} className="chart-label mb-1.5 block">
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
          <label htmlFor={f("childName")} className="chart-label mb-1.5 block">
            Child&rsquo;s name
          </label>
          <input id={f("childName")} name="childName" className="field" {...aria("childName")} />
          {err("childName")}
        </div>

        <div>
          <label htmlFor={f("seekingClass")} className="chart-label mb-1.5 block">
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

        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor={f("message")} className="chart-label mb-1.5 block">
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

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
          {status === "sending" ? null : <Icon name="arrow" size={15} />}
        </button>
        <p className="text-sm text-ink-soft">
          Or call{" "}
          <a href={school.phones[1].href} className="font-semibold underline">
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
