import { metafieldSet as metafieldSetGraphql } from "@/graphql/metafields/mutations/metafield-set";
import { authenticate } from "@/shopify.server";
import { AdminApiContext } from "@shopify/shopify-app-react-router/server";

export type MetafieldSetDto = {
  type: string;
  ownerId: string;
  namespace: string;
  key: string;
  value: string;
};

export const metafieldSet = async (
  request: Request,
  dto: MetafieldSetDto,
): Promise<{ success: boolean; error?: string; details?: any }> => {
  const { admin } = await authenticate.admin(request);
  const { ownerId, namespace, key, value, type } = dto;

  try {
    await admin.graphql(metafieldSetGraphql, {
      variables: {
        metafields: [
          {
            ownerId,
            namespace,
            type,
            key,
            value,
          },
        ],
      },
    });
  } catch (error) {
    return { success: false, error: "Failed to set metafield", details: error };
  }

  return { success: true };
};
