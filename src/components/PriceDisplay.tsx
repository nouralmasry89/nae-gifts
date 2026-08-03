import type { Product } from "@/lib/products";
import { applyDiscount } from "@/lib/discount";

export function PriceDisplay({
  product,
  discountActive,
  className,
}: {
  product: Product;
  discountActive: boolean;
  className?: string;
}) {
  if (product.priceNote) {
    return <span className={className}>{product.priceNote}</span>;
  }

  if (product.priceNew === 0) {
    return <span className={className}>يمكنكم حساب الكلفة من خلال تعبئة جدول الطلب</span>;
  }

  if (!discountActive) {
    return (
      <span className={className}>
        {product.priceNew.toLocaleString("ar")} ل.س جديدة • {product.priceOld.toLocaleString("ar")} ل.س قديمة
      </span>
    );
  }

  const newDisc = applyDiscount(product.priceNew, true);
  const oldDisc = applyDiscount(product.priceOld, true);

  return (
    <span className={className}>
      <span className="ml-1 text-muted-foreground/70 line-through">
        {product.priceNew.toLocaleString("ar")}
      </span>{" "}
      <span className="font-extrabold text-primary">{newDisc.toLocaleString("ar")} ل.س جديدة</span>
      {" • "}
      <span className="ml-1 text-muted-foreground/70 line-through">
        {product.priceOld.toLocaleString("ar")}
      </span>{" "}
      <span className="font-extrabold text-primary">{oldDisc.toLocaleString("ar")} ل.س قديمة</span>
    </span>
  );
}
