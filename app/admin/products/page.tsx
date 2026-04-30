import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; category?: string };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, category } = searchParams;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }] } : {},
        category ? { category: { equals: category, mode: "insensitive" } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const allCategories = await prisma.product.groupBy({ by: ["category"] });

  const stockSummary = {
    total: products.length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <form method="GET" style={{ display: "flex", gap: 8 }}>
            <div className="admin-search" style={{ maxWidth: 260 }}>
              <i className="fas fa-search search-icon" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="admin-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select name="category" className="admin-input" style={{ width: 160 }}>
              <option value="">All Categories</option>
              {allCategories.map((c) => (
                <option key={c.category} value={c.category} selected={category === c.category}>
                  {c.category}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-admin-secondary">Filter</button>
            {(q || category) && (
              <Link href="/admin/products" className="btn-admin-secondary">Clear</Link>
            )}
          </form>
        </div>
        <Link href="/admin/products/new" className="btn-admin-primary">
          <i className="fas fa-plus" /> Add Product
        </Link>
      </div>

      {/* Stock summary mini stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Products", value: stockSummary.total, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Out of Stock", value: stockSummary.outOfStock, color: "#ef4444", bg: "#fee2e2" },
          { label: "Low Stock", value: stockSummary.lowStock, color: "#f59e0b", bg: "#fef3c7" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: "0.78rem", color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2 className="data-card-title">
            {q || category ? `Results (${products.length})` : `All Products (${products.length})`}
          </h2>
        </div>
        <div className="data-card-body">
          {products.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open" />
              <p>No products found.</p>
              <Link href="/admin/products/new" className="btn-admin-primary">Add First Product</Link>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f8f9fc", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
                          ) : (
                            <i className="fas fa-image" style={{ color: "#ccc" }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e2030" }}>{p.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#aaa", fontFamily: "monospace" }}>/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#f0f2f7", color: "#555", padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ color: "#666" }}>{p.brand}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#d10024" }}>${(p.salePrice ?? p.price).toFixed(2)}</span>
                      {p.salePrice && (
                        <span style={{ fontSize: "0.75rem", color: "#aaa", textDecoration: "line-through", marginLeft: 6 }}>
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        background: p.stock === 0 ? "#fee2e2" : p.stock <= 5 ? "#fef3c7" : "#d1fae5",
                        color: p.stock === 0 ? "#991b1b" : p.stock <= 5 ? "#92400e" : "#065f46",
                        padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                      }}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/product/${p.slug}`} className="btn-icon" title="View on store" target="_blank">
                          <i className="fas fa-eye" />
                        </Link>
                        <Link href={`/admin/products/${p.id}`} className="btn-icon" title="Edit">
                          <i className="fas fa-edit" />
                        </Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
