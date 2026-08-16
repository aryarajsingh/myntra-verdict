import { ItemVerdict } from "@/components/ItemVerdict";
import { PRODUCTS } from "@/data/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default function Page() {
  return <ItemVerdict />;
}
