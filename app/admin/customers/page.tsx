import { prisma } from "@/lib/prisma";
import ToggleCustomerButton from "@/components/ToggleCustomerButton";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; status?: string };
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q, status } = searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      AND: [
        q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
        status === "active" ? { active: true } : status === "disabled" ? { active: false } : {},
      ],
    },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalActive = customers.filter((c) => c.active).length;
  const totalDisabled = customers.filter((c) => !c.active).length;

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Customers", value: customers.length, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Active", value: totalActive, color: "#10b981", bg: "#ecfdf5" },
          { label: "Disabled", value: totalDisabled, color: "#6b7280", bg: "#f9fafb" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "0.78rem", color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <form method="GET" style={{ display: "flex", gap: 8, flex: 1 }}>
          <div className="admin-search" style={{ maxWidth: 280 }}>
            <i className="fas fa-search search-icon" />
            <input name="q" defaultValue={q} placeholder="Search by name or email..." className="admin-input" style={{ paddingLeft: 36 }} />
          </div>
          <select name="status" className="admin-input" style={{ width: 140 }}>
            <option value="">All Status</option>
            <option value="active" selected={status === "active"}>Active</option>
            <option value="disabled" selected={status === "disabled"}>Disabled</option>
          </select>
          <button type="submit" className="btn-admin-secondary">Filter</button>
          {(q || status) && <a href="/admin/customers" className="btn-admin-secondary">Clear</a>}
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2 className="data-card-title">Customers ({customers.length})</h2>
        </div>
        <div className="data-card-body">
          {customers.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users" />
              <p>No customers found.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const totalSpent = c.orders.reduce((a, o) => a + o.total, 0);
                  const initial = (c.name ?? c.email)[0].toUpperCase();
                  const colors = ["#d10024", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
                  const col = colors[initial.charCodeAt(0) % colors.length];

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: col, color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {initial}
                          </div>
                          <span style={{ fontWeight: 600 }}>{c.name ?? "—"}</span>
                        </div>
                      </td>
                      <td style={{ color: "#666" }}>{c.email}</td>
                      <td>
                        <span style={{ background: "#f0f2f7", color: "#555", padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                          {c._count.orders}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#1e2030" }}>${totalSpent.toFixed(2)}</td>
                      <td style={{ color: "#888", fontSize: "0.82rem" }}>
                        {new Date(c.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span style={{
                          background: c.active ? "#d1fae5" : "#f3f4f6",
                          color: c.active ? "#065f46" : "#6b7280",
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <ToggleCustomerButton id={c.id} active={c.active} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
