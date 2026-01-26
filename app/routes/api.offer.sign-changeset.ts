import jwt from "jsonwebtoken";

import { authenticate } from "../shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  return cors(Response.json({}));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);

  const { changes, referenceId } = await request.json();

  const payload = {
    iss: process.env.SHOPIFY_API_KEY,
    jti: crypto.randomUUID(),
    iat: Date.now(),
    sub: referenceId,
    changes,
  };

  const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET || "");
  return cors(new Response(JSON.stringify({ token })));
};
