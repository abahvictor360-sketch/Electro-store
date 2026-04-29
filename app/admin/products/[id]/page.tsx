import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const product = isNew ? null : await prisma.product.findUnique({ where: { id: params.id } });

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>
        {isNew ? "Add New Product" : "Edit Product"}
      </h2>
      <ProductForm product={product} />
    </div>
  );
}
