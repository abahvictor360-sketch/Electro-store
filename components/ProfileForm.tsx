"use client";

import { useState } from "react";
import type { Address } from "@prisma/client";

interface Props {
  user: { id: string; name: string | null; email: string; addresses: Address[] };
}

export default function ProfileForm({ user }: Props) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(""); setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { name: fd.get("name") as string };
    const password = fd.get("password") as string;
    if (password) body.password = password;

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Update failed");
    } else {
      setSuccess("Profile updated successfully.");
    }
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <h5 className="fw-bold mb-4">Personal Information</h5>
      {success && <div className="alert alert-success py-2">{success}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Full Name</label>
          <input name="name" className="form-control" defaultValue={user.name ?? ""} required />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Email Address</label>
          <input className="form-control" defaultValue={user.email} disabled />
          <small className="text-muted">Email cannot be changed</small>
        </div>
        <hr className="my-4" />
        <h6 className="fw-bold mb-3">Change Password</h6>
        <div className="mb-3">
          <label className="form-label fw-semibold">New Password</label>
          <input name="password" type="password" className="form-control" placeholder="Leave blank to keep current" minLength={8} />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">Confirm New Password</label>
          <input name="confirmPassword" type="password" className="form-control" placeholder="Confirm new password" />
        </div>
        <button type="submit" className="btn btn-electro px-4" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
