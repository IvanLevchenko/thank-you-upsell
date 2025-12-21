import { authenticate } from "@/shopify.server";
import { products } from "@/graphql/products/queries/products";
import { Connection } from "@/types/connection";
import { Product } from "@/types/product";

export const getProducts = async (
  request: Request,
): Promise<Connection<Product>> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (await admin.graphql(products)).json();

  return data.products as Connection<Product>;
};
