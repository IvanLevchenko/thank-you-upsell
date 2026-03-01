import { ActionFunctionArgs } from "react-router";
import type { UpsellMode } from "@prisma/client";

import { authenticate } from "@/shopify.server";
import prisma from "@/db.server";
import { DefaultResponse } from "@/types/default-response";
import { IdConverter } from "@/helpers/id-converter";
import { getProduct } from "@/queries/product/get-product";
import { getShop } from "@/queries/shop/get-shop";

export type ProductRefreshDto = {
  mode?: UpsellMode;
  collectionId?: string;
  enabled?: boolean;
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<DefaultResponse> => {
  await authenticate.admin(request);
  const id = new URL(request.url).pathname
    .replace("/api/upsells/", "")
    .replace("/refresh", "");

  const { mode, collectionId, enabled } =
    (await request.json()) as ProductRefreshDto;

  const productId = IdConverter.fromNumberToShopifyId(id);
  let productUpsell = await prisma.productUpsell.findFirst({
    where: {
      productId,
    },
  });

  if (!productUpsell) {
    const product = await getProduct(request, productId);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const { myshopifyDomain: store } = await getShop(request);

    productUpsell = await prisma.productUpsell.create({
      data: {
        productId,
        mode,
        collectionId,
        enabled,
        store,
        title: product.title,
      },
    });
  } else {
    productUpsell = await prisma.productUpsell.update({
      where: { id: productUpsell.id },
      data: {
        mode,
        collectionId,
        enabled,
      },
    });
  }

  return { success: true, data: productUpsell };
};
