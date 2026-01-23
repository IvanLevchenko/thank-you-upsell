import { getProductWithMetafield } from "@/queries/product/get-product";
import { authenticate } from "@/shopify.server";
import { UpsellVariantsMetafield } from "@/utils/constants";
import { LoaderFunctionArgs } from "react-router";

// Returns a list of variant ids from the product metafield
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const id = new URL(request.url).pathname.split("/")[1];

  if (id) {
    const product = await getProductWithMetafield(
      request,
      id,
      UpsellVariantsMetafield.namespace,
      UpsellVariantsMetafield.key,
    );

    return new Response(product.metafield?.value || "[]");
  }

  return new Response("No id provided", { status: 400 });
};
