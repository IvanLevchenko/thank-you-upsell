import { Shop } from "@/types/shop";
import { shop } from "@/graphql/shop/shop";
import { authenticate } from "@/shopify.server";

export const getShop = async (request: Request): Promise<Shop> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (await admin.graphql(shop)).json();
  return data.shop as Shop;
};
