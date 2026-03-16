import { productVariant } from "@/graphql/product-variants/queries/product-variant";
import type { ProductVariant } from "@/types/product-variant";
import { AdminApiContext } from "@shopify/shopify-app-react-router/server";

export const getVariant = async (
  graphql: AdminApiContext["graphql"],
  id: string,
): Promise<ProductVariant> => {
  const { data } = await (
    await graphql(productVariant, { variables: { id } })
  ).json();

  return data.variant as ProductVariant;
};
