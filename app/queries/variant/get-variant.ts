import { productVariant } from "@/graphql/product-variants/queries/product-variant";
import { authenticate } from "@/shopify.server";
import type { ProductVariant } from "@/types/product-variant";

export const getVariant = async (
  request: Request,
  id: string,
): Promise<ProductVariant> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (
    await admin.graphql(productVariant, { variables: { id } })
  ).json();

  return data.variant as ProductVariant;
};
