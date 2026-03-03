import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { CallbackEvent } from "@shopify/polaris-types";
import {
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAppBridge } from "@shopify/app-bridge-react";

import { authenticate } from "../shopify.server";
import { UpsellFilter } from "@/types/upsell-filter";
import { UpsellEnabledFilter } from "@/enums/upsell-enabled-label";
import { SocketEvents } from "@/enums/socket-events";
import { getShop } from "@/queries/shop/get-shop";
import UpsellDao from "@/dao/upsell";
import Pagination from "@/components/general/pagination";
import WithOverlay from "@/components/hocs/with-overlay";

import "../index.css";

const SYNC_PRODUCTS_MODAL_ID = "sync-products-modal";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const title = searchParams.get("title");
  const enabled = searchParams.has("enabled")
    ? searchParams.get("enabled") === "true"
    : undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;

  const filter: UpsellFilter = {};
  if (title) {
    filter.title = title;
  }

  if (enabled !== undefined) {
    filter.enabled = enabled;
  }

  const take = 10;

  const upsells = await UpsellDao.list(filter, page, take);
  const totalUpsells = await UpsellDao.count(filter);
  const shop = await getShop(request);

  return { upsells, totalUpsells, take, page, shop };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const { upsells, totalUpsells, take, page, shop } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const revalidator = useRevalidator();

  const [isLoading, setIsLoading] = useState(false);

  const handleOpenProduct = (gid: string) => {
    const url = new URL(gid);
    const productId = url.pathname.split("/").pop();

    navigate(`/app/upsells/${productId}`);
  };

  const searchDelay = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (event: CallbackEvent<"s-search-field">) => {
    if (searchDelay.current) {
      clearTimeout(searchDelay.current);
    }
    const input = event.currentTarget.value;
    searchDelay.current = setTimeout(async () => {
      setIsLoading(true);
      setSearchParams(
        input.length ? { ...getExistingSearchParams(), title: input } : {},
      );
    }, 500);
  };

  const handleStatusChange = (event: CallbackEvent<"s-select">) => {
    const value = event.currentTarget.value;

    setIsLoading(true);
    setSearchParams(
      value === UpsellEnabledFilter.All
        ? {}
        : {
            ...getExistingSearchParams(),
            enabled: value === UpsellEnabledFilter.Active ? "true" : "false",
          },
    );
  };

  const handleSyncProducts = () => {
    setIsLoading(true);

    const socket = io("http://localhost:3005");
    socket.on("connect", () => {
      socket.emit(SocketEvents.SYNC_PRODUCTS, shop.myshopifyDomain);
    });

    socket.on(SocketEvents.SYNC_PRODUCTS_COMPLETED, () => {
      socket.disconnect();

      appBridge.toast.show("Sync completed");
      setIsLoading(false);

      revalidator.revalidate();
    });
  };

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setSearchParams({ ...getExistingSearchParams(), page: page.toString() });
  };

  const getExistingSearchParams = () => {
    return Object.fromEntries(searchParams.entries());
  };

  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  return (
    <s-page heading="Shopify app template">
      <s-popover id={SYNC_PRODUCTS_MODAL_ID}>
        <s-stack padding="small">
          <s-paragraph>Start syncing products to enable upsells</s-paragraph>
          <s-stack direction="inline" gap="small" paddingBlockStart="small">
            <s-button variant="primary" onClick={handleSyncProducts}>
              Sync products
            </s-button>
            <s-button commandFor={SYNC_PRODUCTS_MODAL_ID} command="--hide">
              Cancel
            </s-button>
          </s-stack>
        </s-stack>
      </s-popover>
      <s-stack padding="base none">
        <s-button variant="primary" commandFor={SYNC_PRODUCTS_MODAL_ID}>
          Sync products
        </s-button>
      </s-stack>
      <s-section heading="Products" padding="base">
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
        <WithOverlay isLoading={isLoading}>
          <s-stack gap="base">
            {upsells.length ? (
              upsells.map((upsell) => {
                const imageUrl = upsell.image;
                const enabled = upsell.enabled;

                return (
                  <s-clickable
                    key={upsell.id}
                    blockSize="100px"
                    padding="small"
                    disabled={isLoading}
                    onClick={() => handleOpenProduct(upsell.productId)}
                  >
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small"
                      >
                        <img
                          width={50}
                          src={imageUrl || ""}
                          alt={upsell.title}
                        />
                        <s-heading>{upsell.title}</s-heading>
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
              })
            ) : (
              <s-stack direction="inline" alignItems="center" gap="small">
                <s-icon type="info" size="base"></s-icon>
                <s-text>No upsells found</s-text>
              </s-stack>
            )}
          </s-stack>
        </WithOverlay>
      </s-section>
      <Pagination
        totalItems={totalUpsells}
        itemsPerPage={take}
        currentPage={page}
        onPageChange={handlePageChange}
      />
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
