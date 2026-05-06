import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StockUpdateCell from "@/components/StockUpdateCell";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { filter?: string; q?: string };
}

export default async function InventoryPage({ searchParams }: Props) {
  const { filter, q } = searchParams;

  const where: Record<string, unknown> = {};
  if (filter === "low")       where.stock = { gt: 0, lte: 5 };
  else if (filter === "out")  where.stock = 0;
  else if (filter === "ok")   where.stock = { gt: 5 };

  if (q) {
    (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, outCount, lowCount, okCount, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { stock: "asc" },
      select: { id: true, name: true, slug: true, category: true, brand: true, stock: true, price: true, images: true },
    }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { stock: { gt: 5 } } }),
    prisma.product.count(),
  ]);

  const filters = [
    { key: "",    label: "All Products", count: totalCount, color: "#555" },
    { key: "out", label: "Out of Stock",  count: outCount,  color: "#991b1b" },
    { key: "low", label: "Low Stock",     count: lowCount,  color: "#92400e" },
    { key: "ok",  label: "In Stock",      count: okCount,   color: "#065f46" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#1e2030" }}>Inventory</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.82rem" }}>Manage product stock levels</p>
        </div>
        <Link href="/admin/products/new" className="btn-ap">
          <i className="fas fa-plus" /> Add Product
        </Link>
      </div>

      {/* KPI chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Out of Stock", count: outCount, bg: "#fee2e2", color: "#991b1b", icon: "fa-times-circle" },
          { label: "Low Stock (≤5)", count: lowCount, bg: "#fef3c7", color: "#92400e", icon: "fa-exclamation-triangle" },
          { label: "In Stock", count: okCount, bg: "#d1fae5", color: "#065f46", icon: "fa-check-circle" },
        ].map((k) => (
          <div key={k.label} style={{ background: k.bg, color: k.color, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
            <i className={`fas ${k.icon}`} style={{ fontSize: 18 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", lineHeight: 1 }}>{k.count}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.8 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/inventory${f.key ? `?filter=${f.key}` : ""}`}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600,
              textDecoration: "none", transition: "all 0.15s",
              background: filter === f.key || (!filter && f.key === "") ? "#1e2030" : "#fff",
              color: filter === f.key || (!filter && f.key === "") ? "#fff" : "#555",
              border: `1px solid ${filter === f.key || (!filter && f.key === "") ? "#1e2030" : "#e0e0e0"}`,
            }}
          >
            {f.label} <span style={{ opacity: 0.6 }}>({f.count})</span>
          </Link>
        ))}

        <form method="GET" action="/admin/inventory" style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {filter && <input type="hidden" name="filter" value={filter} />}
          <div className="a-search" style={{ position: "relative" }}>
            <i className="fas fa-search a-search-icon" />
            <input
              name="q"
              defaultValue={q}
              className="a-input"
              placeholder="Search products…"
              style={{ paddingLeft: 34, width: 220 }}
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-body">
          {products.length === 0 ? (
            <div className="empty-state" style={{ padding: "50px 20px" }}>
              <i className="fas fa-box-open" />
              <p>No products match this filter.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stockLabel =
                    p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock";
                  const stockStyle =
                    p.stock === 0
                      ? { bg: "#fee2e2", color: "#991b1b" }
                      : p.stock <= 5
                      ? { bg: "#fef3c7", color: "#92400e" }
                      : { bg: "#d1fae5", color: "#065f46" };

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", background: "#f8f9fc", flexShrink: 0 }}>
                            <img
                              src={p.images?.[0] || "/img/product01.png"}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, color: "#1e2030", fontSize: "0.855rem" }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "#f0f2f7", color: "#555", fontSize: "0.75rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ color: "#888", fontSize: "0.82rem" }}>{p.brand}</td>
                      <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                      <td>
                        <StockUpdateCell productId={p.id} initialStock={p.stock} />
                      </td>
                      <td>
                        <span style={{ background: stockStyle.bg, color: stockStyle.color, fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                          {stockLabel}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/products/${p.id}`} className="btn-icon" title="Edit product">
                          <i className="fas fa-pen" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ color: "#bbb", fontSize: "0.78rem", marginTop: 12 }}>
        <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
        Click the stock number to edit it inline. Changes save immediately.
      </p>
    </div>
  );
}
