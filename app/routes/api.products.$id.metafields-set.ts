import { ActionFunctionArgs } from "react-router";

import { IdConverter } from "@/helpers/id-converter";
import {
  metafieldSet,
  MetafieldSetDto,
} from "@/mutations/metafield/set-metafield";
import { authenticate } from "@/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const body = await request.json();
  const { ownerId, namespace, key, value, type } = body as MetafieldSetDto;

  return metafieldSet(request, {
    ownerId: IdConverter.fromNumberToShopifyId(ownerId),
    namespace,
    key,
    value,
    type,
  });
};
