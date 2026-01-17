import { authenticate } from "@/shopify.server";
import {
  product,
  productWithMetafield,
} from "@/graphql/products/queries/product";
import { Product } from "@/types/product";
import { fromNumberToShopifyId } from "@/helpers/from-number-to-shopify-id";
import { UpsellVariantsMetafield } from "@/utils/constants";

export const getProduct = async (
  request: Request,
  id: string,
): Promise<Product> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (
    await admin.graphql(
      product(UpsellVariantsMetafield.namespace, UpsellVariantsMetafield.key),
      { variables: { id } },
    )
  ).json();

  return data.product as Product;
};

export const getProductWithMetafield = async (
  request: Request,
  id: string,
  namespace: string,
  key: string,
): Promise<Product> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (
    await admin.graphql(productWithMetafield(namespace, key), {
      variables: { id: fromNumberToShopifyId(id) },
    })
  ).json();

  return data.product as Product;
};
