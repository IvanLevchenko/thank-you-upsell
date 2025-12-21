import { authenticate } from "@/shopify.server";
import { product } from "@/graphql/products/queries/product";
import { Product } from "@/types/product";

export const getProduct = async (
  request: Request,
  id: string,
): Promise<Product> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (
    await admin.graphql(product, { variables: { id } })
  ).json();

  return data.product as Product;
};
