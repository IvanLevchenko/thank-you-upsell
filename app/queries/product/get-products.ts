import { authenticate } from "@/shopify.server";
import { products } from "@/graphql/products/queries/products";
import { Connection } from "@/types/connection";
import { Product } from "@/types/product";
import { UpsellFilter } from "@/types/upsell-filter";

export const getProducts = async (
  request: Request,
  filter: UpsellFilter = {},
): Promise<Connection<Product>> => {
  const { admin } = await authenticate.admin(request);
  console.log(products(filter));
  const { data } = await (await admin.graphql(products(filter))).json();
  console.log(data);

  return data.products as Connection<Product>;
};
