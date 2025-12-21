import { authenticate } from "../shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  return cors(Response.json({}));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  const { referenceId } = await request.json();

  console.log("__test", referenceId);
  return cors(Response.json({}));
};
