import { collections } from "@/graphql/collections/queries/collections";
import { authenticate } from "@/shopify.server";
import { Collection } from "@/types/collection";

export const getCollections = async (
  request: Request,
): Promise<Collection[]> => {
  const { admin } = await authenticate.admin(request);
  const { data } = await (await admin.graphql(collections)).json();

  return data.collections.edges.map((edge: any) => edge.node);
};
