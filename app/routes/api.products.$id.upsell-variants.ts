import { getProductWithMetafield } from "@/queries/product/get-product";
import { authenticate } from "@/shopify.server";
import { UpsellVariantsMetafield } from "@/utils/constants";
import { LoaderFunctionArgs } from "react-router";

// Returns a list of variant ids from the product metafield
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const id = new URL(request.url).pathname
    .replace("/api/products/", "")
    .replace("/upsell-variants", "");

  if (id) {
    const product = await getProductWithMetafield(
      admin.graphql,
      id,
      UpsellVariantsMetafield.namespace,
      UpsellVariantsMetafield.key,
    );

    return new Response(product?.metafield?.value || "[]");
  }

  return new Response("No id provided", { status: 400 });
};
