import type { Product } from "@/data/types";

const CUT: Record<Product["category"], string> = {
  bottoms: "trousers",
  tops: "shirt",
  ethnic: "kurta",
  dress: "dress",
  saree: "saree",
};

export function ProductArt({ product, tall }: { product: Product; tall?: boolean }) {
  return (
    <div
      className={`gart ${tall ? "gart-tall" : ""} gart-${CUT[product.category]}`}
      style={{ background: product.imageBg }}
      role="img"
      aria-label={`${product.brand} ${product.name}`}
    >
      <span className="gart-cut" />
      <span className="gart-meta">
        {product.brand}
        <b>{product.name}</b>
      </span>
    </div>
  );
}
