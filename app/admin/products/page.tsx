import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: "var(--dark)" }}>Products</h2>
        <Link href="/admin/products/new" className="btn btn-electro">
          <i className="fas fa-plus me-2" /> Add Product
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th className="py-3 ps-3">Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="align-middle">
                  <td className="ps-3 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="border rounded d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40, background: "#f8f9fa", flexShrink: 0 }}>
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" style={{ maxWidth: 36, maxHeight: 36, objectFit: "contain" }} />
                        ) : (
                          <i className="fas fa-image text-muted" />
                        )}
                      </div>
                      <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="text-capitalize">{p.category}</td>
                  <td>{p.brand}</td>
                  <td>
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>${(p.salePrice ?? p.price).toFixed(2)}</span>
                    {p.salePrice && <small className="text-muted ms-1 text-decoration-line-through">${p.price.toFixed(2)}</small>}
                  </td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? "bg-danger" : p.stock <= 5 ? "bg-warning text-dark" : "bg-success"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-edit" />
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-box-open fa-3x mb-3" />
            <p>No products yet. <Link href="/admin/products/new">Add your first product</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}
