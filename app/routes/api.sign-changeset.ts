// import jwt from "jsonwebtoken";

import { authenticate } from "../shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.checkout(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);

  // const body = await request.json();

  // const selectedOffer = await getOffer(request);

  // const payload = {
  //   iss: process.env.SHOPIFY_API_KEY,
  //   jti: crypto.randomUUID(),
  //   iat: Date.now(),
  //   sub: body.referenceId,
  //   changes: selectedOffer?.changes,
  // };

  // const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET || "");
  return cors(new Response(JSON.stringify({ token: 1 })));
};
