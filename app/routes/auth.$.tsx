import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // console.log("Received auth callback");

  // await admin?.graphql(metafieldDefinitionCreate, {
  //   variables: {
  //     definition: {
  //       name: "Post purchase offers list",
  //       namespace: "thank-you-upsell",
  //       key: "offers",
  //       type: "list.variant_reference",
  //       description: "Thank you upsell",
  //       ownerType: "PRODUCT",
  //     },
  //   },
  // });

  return null;
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
