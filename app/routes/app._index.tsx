import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { CallbackEvent } from "@shopify/polaris-types";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { useRef } from "react";

import { authenticate } from "../shopify.server";
import { getProducts } from "../queries/product/get-products";
import { FilterQuery } from "@/types/filter-query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const title = searchParams.get("title");

  const filter: FilterQuery = {};
  if (title) {
    filter.title = title;
  }

  const products = await getProducts(request, filter);

  return { productsConnection: products };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const { productsConnection } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleOpenProduct = (gid: string) => {
    const url = new URL(gid);
    const productId = url.pathname.split("/").pop();
    navigate(`/app/product/${productId}`);
  };

  const searchDelay = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (event: CallbackEvent<"s-search-field">) => {
    if (searchDelay.current) {
      clearTimeout(searchDelay.current);
    }
    const input = event.currentTarget.value;
    searchDelay.current = setTimeout(async () => {
      setSearchParams(input.length ? { title: input } : {});
    }, 500);
  };

  return (
    <s-page heading="Shopify app template">
      <s-section heading="Products">
        <s-search-field onInput={handleSearch}></s-search-field>
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
