import { ActionFunctionArgs } from "react-router";
import type { UpsellMode } from "@prisma/client";

import { authenticate } from "@/shopify.server";
import prisma from "@/db.server";
import { DefaultResponse } from "@/types/default-response";

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
    .replace("/api/products/", "")
    .replace("/refresh", "");

  const { mode, collectionId, enabled } =
    (await request.json()) as ProductRefreshDto;

  let productUpsell = await prisma.productUpsell.findFirst({
    where: {
      productId: id,
    },
  });

  if (!productUpsell) {
    productUpsell = await prisma.productUpsell.create({
      data: {
        productId: id,
        mode,
        collectionId,
        enabled,
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
