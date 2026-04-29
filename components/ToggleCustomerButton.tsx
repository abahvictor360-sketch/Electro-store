"use client";

import { useRouter } from "next/navigation";

export default function ToggleCustomerButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();

  async function toggle() {
    const action = active ? "disable" : "enable";
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;
    await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <button
      className={`btn btn-sm ${active ? "btn-outline-danger" : "btn-outline-success"}`}
      onClick={toggle}
    >
      {active ? "Disable" : "Enable"}
    </button>
  );
}
