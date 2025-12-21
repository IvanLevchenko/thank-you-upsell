import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getProducts } from "../queries/product/get-products";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const products = await getProducts(request);

  return { productsConnection: products };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const { productsConnection } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const handleOpenProduct = (gid: string) => {
    const url = new URL(gid);
    const productId = url.pathname.split("/").pop();
    navigate(`/app/product/${productId}`);
  };

  return (
    <s-page heading="Shopify app template">
      <s-section heading="Products">
        <s-search-field></s-search-field>
        <s-stack gap="base">
          {(productsConnection.edges || []).map((edge) => {
            const imageUrl =
              edge.node?.media?.edges[0]?.node?.preview?.image?.url;
            return (
              <s-clickable
                key={edge.node.id}
                padding="small"
                onClick={() => handleOpenProduct(edge.node.id)}
              >
                <s-stack direction="inline" alignItems="center" gap="small">
                  <img width={50} src={imageUrl || ""} alt={edge.node.title} />
                  <s-heading>{edge.node.title}</s-heading>
                </s-stack>
              </s-clickable>
            );
          })}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
