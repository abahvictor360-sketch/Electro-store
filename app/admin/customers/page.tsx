import { prisma } from "@/lib/prisma";
import ToggleCustomerButton from "@/components/ToggleCustomerButton";
import UserRoleButton from "@/components/UserRoleButton";
import AddUserModal from "@/components/AddUserModal";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; status?: string; role?: string };
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q, status, role } = searchParams;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.active = true;
  else if (status === "disabled") where.active = false;
  if (role === "ADMIN") where.role = "ADMIN";
  else if (role === "CUSTOMER") where.role = "CUSTOMER";

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const totalAdmins    = users.filter((u) => u.role === "ADMIN").length;
  const totalActive    = users.filter((u) => u.active).length;
  const totalDisabled  = users.filter((u) => !u.active).length;

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "All Users",   value: users.length,   color: "#3b82f6", bg: "#eff6ff" },
          { label: "Customers",   value: totalCustomers, color: "#8b5cf6", bg: "#f5f3ff" },
          { label: "Admins",      value: totalAdmins,    color: "#d10024", bg: "#fff1f2" },
          { label: "Active",      value: totalActive,    color: "#10b981", bg: "#ecfdf5" },
          { label: "Disabled",    value: totalDisabled,  color: "#6b7280", bg: "#f9fafb" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, minWidth: 130 }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "0.75rem", color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <form method="GET" style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
          <div className="admin-search" style={{ maxWidth: 260 }}>
            <i className="fas fa-search search-icon" />
            <input name="q" defaultValue={q} placeholder="Search by name or email…" className="admin-input" style={{ paddingLeft: 36 }} />
          </div>
          <select name="role" className="admin-input" style={{ width: 130 }} defaultValue={role ?? ""}>
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select name="status" className="admin-input" style={{ width: 130 }} defaultValue={status ?? ""}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button type="submit" className="btn-admin-secondary">Filter</button>
          {(q || status || role) && (
            <a href="/admin/customers" className="btn-admin-secondary">Clear</a>
          )}
        </form>
        <AddUserModal />
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2 className="data-card-title">Users ({users.length})</h2>
        </div>
        <div className="data-card-body">
          {users.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users" />
              <p>No users found.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const totalSpent = u.orders.reduce((a, o) => a + o.total, 0);
                  const initial = (u.name ?? u.email)[0].toUpperCase();
                  const colors = ["#d10024", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
                  const col = colors[initial.charCodeAt(0) % colors.length];

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: col, color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {initial}
                          </div>
                          <span style={{ fontWeight: 600 }}>{u.name ?? "—"}</span>
                        </div>
                      </td>
                      <td style={{ color: "#666" }}>{u.email}</td>
                      <td>
                        <span style={{
                          background: u.role === "ADMIN" ? "#fff1f2" : "#f0f2f7",
                          color:      u.role === "ADMIN" ? "#d10024"  : "#555",
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {u.role === "ADMIN" ? "Admin" : "Customer"}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: "#f0f2f7", color: "#555", padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                          {u._count.orders}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#1e2030" }}>${totalSpent.toFixed(2)}</td>
                      <td style={{ color: "#888", fontSize: "0.82rem" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span style={{
                          background: u.active ? "#d1fae5" : "#f3f4f6",
                          color:      u.active ? "#065f46" : "#6b7280",
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {u.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <UserRoleButton id={u.id} role={u.role} />
                          <ToggleCustomerButton id={u.id} active={u.active} />
                        </div>
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
