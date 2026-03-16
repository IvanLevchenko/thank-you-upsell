import { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import { EnsureCORSFunction } from "node_modules/@shopify/shopify-app-react-router/dist/ts/server/authenticate/helpers/ensure-cors-headers";
import { LoaderFunctionArgs } from "react-router";

import { getProductWithMetafield } from "@/queries/product/get-product";
import { authenticate, unauthenticated } from "@/shopify.server";
import { UpsellVariantsMetafield } from "@/utils/constants";
import { IdConverter, ShopifyEntity } from "@/helpers/id-converter";
import { getVariant } from "@/queries/variant/get-variant";

// Returns a list of variant ids from the product metafield
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const isCheckout = url.searchParams.get("checkout") === "true";
  const id = url.pathname
    .replace("/api/products/", "")
    .replace("/metafield-variants", "");

  let admin: AdminApiContext, cors: EnsureCORSFunction;
  if (isCheckout) {
    const authorizedCheckout = await authenticate.public.checkout(request);

    cors = authorizedCheckout.cors;
    admin = (await unauthenticated.admin(authorizedCheckout.sessionToken.dest))
      .admin;
  } else {
    ({ admin, cors } = await authenticate.admin(request));
  }

  if (id) {
    const product = await getProductWithMetafield(
      admin.graphql,
      id,
      UpsellVariantsMetafield.namespace,
      UpsellVariantsMetafield.key,
    );

    const metafieldValue = product?.metafield?.value;

    let variantIds = metafieldValue
      ? (JSON.parse(metafieldValue) as string[])
      : [].map((id) => IdConverter.fromShopifyIdToNumber(id).toString());

    const variants = await Promise.all(
      variantIds.map((id) =>
        getVariant(
          admin.graphql,
          IdConverter.fromNumberToShopifyId(id, ShopifyEntity.ProductVariant),
        ),
      ),
    );

    return cors(new Response(JSON.stringify(variants)));
  }

  return cors(new Response("No id provided", { status: 400 }));
};
