"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRoleButton({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isAdmin = role === "ADMIN";

  async function toggle() {
    if (!confirm(`${isAdmin ? "Demote to Customer" : "Promote to Admin"}?\n\nThis changes the user's access level.`)) return;
    setLoading(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: isAdmin ? "CUSTOMER" : "ADMIN" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isAdmin ? "Demote to Customer" : "Promote to Admin"}
      style={{
        height: 30, padding: "0 10px", border: `1px solid ${isAdmin ? "#fca5a5" : "#86efac"}`,
        borderRadius: 6, background: isAdmin ? "#fee2e2" : "#dcfce7",
        color: isAdmin ? "#991b1b" : "#166534",
        fontSize: "0.72rem", fontWeight: 700, cursor: loading ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
      }}
    >
      {loading
        ? <i className="fas fa-spinner fa-spin" />
        : <><i className={`fas fa-${isAdmin ? "user-minus" : "user-shield"}`} />{isAdmin ? "Demote" : "Make Admin"}</>
      }
    </button>
  );
}
