import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import StoreFilters from "@/components/StoreFilters";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; category?: string; min?: string; max?: string; brand?: string };
}

export default async function StorePage({ searchParams }: Props) {
  const { q, category, min, max, brand } = searchParams;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {},
        category ? { category: { equals: category, mode: "insensitive" } } : {},
        brand ? { brand: { equals: brand, mode: "insensitive" } } : {},
        min ? { price: { gte: parseFloat(min) } } : {},
        max ? { price: { lte: parseFloat(max) } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.product.groupBy({ by: ["category"] });
  const brands = await prisma.product.groupBy({ by: ["brand"] });

  return (
    <>
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active">Shop</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <StoreFilters
              categories={categories.map((c: { category: string }) => c.category)}
              brands={brands.map((b: { brand: string }) => b.brand)}
              current={{ q, category, min, max, brand }}
            />
          </div>

          {/* Products grid */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">
                {q ? `Results for "${q}"` : category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products"}
                <span className="text-muted fw-normal ms-2" style={{ fontSize: "0.9rem" }}>
                  ({products.length} items)
                </span>
              </h5>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-search fa-3x mb-3" />
                <p>No products found. Try a different search.</p>
              </div>
            ) : (
              <div className="row g-3">
                {products.map((p) => (
                  <div key={p.id} className="col-6 col-md-4">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
