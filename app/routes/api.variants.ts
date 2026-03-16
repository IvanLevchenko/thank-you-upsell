import { IdConverter, ShopifyEntity } from "@/helpers/id-converter";
import { getVariant } from "@/queries/variant/get-variant";
import { authenticate } from "@/shopify.server";
import { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const ids = new URL(request.url).searchParams.get("ids");

  if (ids) {
    const variants = await Promise.all(
      ids
        .split(",")
        .map((id) =>
          getVariant(
            admin.graphql,
            IdConverter.fromNumberToShopifyId(id, ShopifyEntity.ProductVariant),
          ),
        ),
    );
    return new Response(JSON.stringify(variants));
  }

  return new Response("No ids provided", { status: 400 });
};
