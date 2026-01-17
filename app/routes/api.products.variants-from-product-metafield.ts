import { getProductWithMetafield } from "@/queries/product/get-product";
import { authenticate } from "@/shopify.server";
import { UpsellVariantsMetafield } from "@/utils/constants";
import { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const id = new URL(request.url).searchParams.get("id");

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
