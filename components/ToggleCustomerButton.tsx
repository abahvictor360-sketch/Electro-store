"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleCustomerButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!confirm(`${active ? "Disable" : "Enable"} this user?`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Disable account" : "Enable account"}
      style={{
        height: 30, padding: "0 10px", border: `1px solid ${active ? "#fca5a5" : "#86efac"}`,
        borderRadius: 6, background: active ? "#fff" : "#dcfce7",
        color: active ? "#991b1b" : "#166534",
        fontSize: "0.72rem", fontWeight: 700, cursor: loading ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 4,
      }}
    >
      {loading
        ? <i className="fas fa-spinner fa-spin" />
        : <><i className={`fas fa-${active ? "ban" : "check"}`} />{active ? "Disable" : "Enable"}</>
      }
    </button>
  );
}
