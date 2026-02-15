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
import UpsellDao from "@/dao/upsell";
import { IdConverter } from "@/helpers/id-converter";
import { UpsellEnabledFilter } from "@/enums/upsell-enabled-label";

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
  const upsells = await UpsellDao.getByIdList(
    products.edges.map((edge) =>
      IdConverter.fromShopifyIdToNumber(edge.node.id).toString(),
    ),
  );

  return { products, upsells };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const { products, upsells } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  console.log(upsells);

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

  const handleStatusChange = (event: CallbackEvent<"s-select">) => {
    const value = event.currentTarget.value;

    setSearchParams(
      value === UpsellEnabledFilter.All
        ? {}
        : { enabled: value === UpsellEnabledFilter.Active ? "true" : "false" },
    );
  };

  return (
    <s-page heading="Shopify app template">
      <s-section heading="Products">
        <s-search-field
          onInput={handleSearch}
          placeholder="Product name"
        ></s-search-field>
        <s-box maxInlineSize="100px" padding="none none base none">
          <s-select label="Upsell status" onChange={handleStatusChange}>
            <s-option value={UpsellEnabledFilter.All} defaultSelected>
              {UpsellEnabledFilter.All}
            </s-option>
            <s-option value={UpsellEnabledFilter.Active}>
              {UpsellEnabledFilter.Active}
            </s-option>
            <s-option value={UpsellEnabledFilter.Inactive}>
              {UpsellEnabledFilter.Inactive}
            </s-option>
          </s-select>
        </s-box>
        <s-stack gap="base">
          {(products.edges || []).map((edge) => {
            const imageUrl =
              edge.node?.media?.edges[0]?.node?.preview?.image?.url;
            const enabled = upsells.find(
              (upsell) =>
                IdConverter.fromNumberToShopifyId(upsell.productId) ===
                edge.node.id,
            )?.enabled;

            return (
              <s-clickable
                key={edge.node.id}
                blockSize="100px"
                padding="small"
                onClick={() => handleOpenProduct(edge.node.id)}
              >
                <s-stack direction="inline" justifyContent="space-between">
                  <s-stack direction="inline" alignItems="center" gap="small">
                    <img
                      width={50}
                      src={imageUrl || ""}
                      alt={edge.node.title}
                    />
                    <s-heading>{edge.node.title}</s-heading>
                  </s-stack>
                  <s-stack
                    direction="inline"
                    inlineSize="auto"
                    alignItems="center"
                  >
                    <s-badge tone={enabled ? "success" : "warning"}>
                      {enabled ? "Active" : "Inactive"}
                    </s-badge>
                  </s-stack>
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
