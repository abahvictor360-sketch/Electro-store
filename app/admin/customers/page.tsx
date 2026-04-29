import { prisma } from "@/lib/prisma";
import ToggleCustomerButton from "@/components/ToggleCustomerButton";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>
        Customer Management
        <span className="text-muted fw-normal ms-2" style={{ fontSize: "1rem" }}>
          ({customers.length} customers)
        </span>
      </h2>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th className="py-3 ps-3">Customer</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="align-middle">
                  <td className="ps-3 py-3 fw-semibold">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36, background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}
                      >
                        {(c.name ?? c.email)[0].toUpperCase()}
                      </div>
                      {c.name ?? "—"}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>{c.email}</td>
                  <td>
                    <span className="badge bg-light text-dark border">{c._count.orders}</span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.active ? "bg-success" : "bg-secondary"}`}>
                      {c.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <ToggleCustomerButton id={c.id} active={c.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <p className="text-center text-muted py-4">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
