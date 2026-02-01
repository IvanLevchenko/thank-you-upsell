import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { authenticate } from "../shopify.server";
import { Offers } from "@/types/offer";
import { ProductVariant } from "@/types/product-variant";
import { IdConverter } from "@/helpers/id-converter";
import prisma from "@/db.server";
import { graphql } from "@/utils/graphql";
import { productWithMetafield } from "@/graphql/products/queries/product";
import { SessionToken } from "@/types/session-token";
import { Product } from "@/types/product";
import { productVariant } from "@/graphql/product-variants/queries/product-variant";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  return cors(Response.json({}));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors, sessionToken } = await authenticate.public.checkout(request);
  const { productIds } = await request.json();

  const shop = (sessionToken as SessionToken).input_data.shop.domain;
  const session = await prisma.session.findFirst({
    where: {
      shop,
    },
  });
  if (!session?.accessToken) {
    return cors(Response.json({ error: "No access token" }, { status: 401 }));
  }

  let products: Product[] = [];

  try {
    products = await Promise.all(
      productIds.map(async (productId: string) => {
        return (
          await graphql<{ product: Product }>(
            shop,
            session?.accessToken,
            productWithMetafield(),
            { id: IdConverter.fromNumberToShopifyId(productId) },
          )
        ).data.product;
      }),
    );
  } catch (error) {
    console.error("Failed to get variants", error);
    return cors(
      Response.json({ error: "Failed to get variants" }, { status: 500 }),
    );
  }

  let variants: ProductVariant[] = [];

  try {
    for (const product of products) {
      const variantIds: string[] = JSON.parse(product.metafield?.value || "[]");

      for (const variantId of variantIds) {
        const variant = await graphql<{ variant: ProductVariant }>(
          shop,
          session?.accessToken,
          productVariant,
          { id: IdConverter.fromNumberToShopifyId(variantId) },
        );
        variants.push(variant.data.variant);
      }
    }
  } catch (error) {
    console.error("Failed to get variants", error);
    return cors(
      Response.json({ error: "Failed to get variants" }, { status: 500 }),
    );
  }

  try {
    const offers: Offers = variants.map((variant) => {
      return {
        id: IdConverter.fromShopifyIdToNumber(variant.product.id),
        title: "TEST TITLE",
        productTitle: variant.title,
        productImageURL:
          variant.media?.edges?.[0]?.node?.preview?.image?.url || "",
        productDescription: ["TEST DESCRIPTION"],
        originalPrice: variant.price,
        discountedPrice: variant.price,
        changes: [
          {
            type: "add_variant",
            variantID: IdConverter.fromShopifyIdToNumber(variant.id),
            quantity: 1,
          },
        ],
      };
    });
    return cors(Response.json({ success: true, data: offers }));
  } catch (error) {
    console.error("Failed to get offer", error);
    return cors(
      Response.json(
        { success: false, error: "Failed to get offer" },
        { status: 500 },
      ),
    );
  }
};
