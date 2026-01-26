import { authenticate } from "@/shopify.server";
import {
  product,
  productWithMetafield,
} from "@/graphql/products/queries/product";
import { Product } from "@/types/product";
import { IdConverter } from "@/helpers/id-converter";
import { UpsellVariantsMetafield } from "@/utils/constants";
import { AdminApiContext } from "@shopify/shopify-app-react-router/server";

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
  graphql: AdminApiContext["graphql"],
  id: string,
  namespace: string = UpsellVariantsMetafield.namespace,
  key: string = UpsellVariantsMetafield.key,
): Promise<Product> => {
  const { data } = await (
    await graphql(productWithMetafield(namespace, key), {
      variables: { id: IdConverter.fromNumberToShopifyId(id) },
    })
  ).json();

  return data.product as Product;
};
