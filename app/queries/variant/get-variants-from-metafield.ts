import { authenticate } from "@/shopify.server";
import { getVariant } from "@/queries/variant/get-variant";
import type { ProductVariant } from "@/types/product-variant";

export const getVariantsFromMetafield = async (
  request: Request,
  metafieldValue: string,
): Promise<ProductVariant[]> => {
  const { admin } = await authenticate.admin(request);

  const variantIds = JSON.parse(metafieldValue) as string[];
  const variants = await Promise.all(
    variantIds.map((id) => getVariant(admin.graphql, id)),
  );

  return variants;
};
