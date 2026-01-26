import { JwtPayload } from "@shopify/shopify-app-react-router/server";

export interface SessionToken extends JwtPayload {
  input_data: {
    shop: {
      domain: string;
    };
  };
}
