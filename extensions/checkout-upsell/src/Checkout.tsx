import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ProductVariant } from "../../../app/types/product-variant";

import { IdConverter } from "../../../app/helpers/id-converter";
import { CallbackEvent } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Banner";
import { getCurrencySymbol } from "./helpers/get-currency-symbol";

export default async () => {
  render(<Extension />, document.body);
};

const APP_URL = "https://vocational-possibly-predict-clay.trycloudflare.com";

function Extension() {
  const lineItemsIds = shopify.lines.value.map((line) =>
    IdConverter.fromShopifyIdToNumber(line.merchandise.product.id),
  );
  const [upsells, setUpsells] = useState<ProductVariant[]>([]);
  const [addedUpsellIds, setAddedUpsellIds] = useState<string[]>([]);
  const [upsellQuantities, setUpsellQuantities] = useState<{
    [key: string]: number;
  }>({});

  const currencySymbol = getCurrencySymbol(
    shopify.cost.totalAmount.value.currencyCode,
  );

  useEffect(() => {
    shopify.sessionToken.get().then(async (token) => {
      const upsellsResponse = await Promise.all(
        lineItemsIds.map(async (id) => {
          const response = await fetch(
            `${APP_URL}/api/products/${id}/metafield-variants?checkout=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          return await response.json();
        }),
      );
      setUpsells([...upsellsResponse.flat(), ...upsellsResponse.flat()]);
    });
  }, []);

  const handleUpsell = async (upsellId: string, isAdded: boolean) => {
    if (isAdded) {
      const lineItem = shopify.lines.value.find(
        (line) => line.merchandise.id === upsellId,
      );
      if (!lineItem) {
        return;
      }
      shopify.applyCartLinesChange({
        type: "removeCartLine",
        id: lineItem?.id,
        quantity: lineItem?.quantity,
      });

      setAddedUpsellIds(addedUpsellIds.filter((id) => id !== upsellId));
    } else {
      const changeCartResult = await shopify.applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: upsellId,
        quantity: upsellQuantities[upsellId] || 1,
      });

      if (changeCartResult.type !== "error") {
        setAddedUpsellIds([...addedUpsellIds, upsellId]);
      } else {
        const quantities = { ...upsellQuantities };
        delete quantities[upsellId];

        setUpsellQuantities({ ...quantities });
      }
    }
  };

  const handleQuantityChange = (upsellId: string, quantity: number) => {
    setUpsellQuantities({ ...upsellQuantities, [upsellId]: quantity });
  };

  return (
    <s-stack direction="inline">
      <s-heading>
        It is not too late to add these products to your order!
      </s-heading>
      <s-scroll-box inlineSize="100%" maxBlockSize="400px">
        <s-stack direction="block" gap="small">
          {upsells.map((upsell) => {
            const isAdded = addedUpsellIds.includes(upsell.id);
            return (
              <s-stack
                key={upsell.id}
                direction="inline"
                justifyContent="space-between"
                paddingBlockStart="small"
              >
                <s-stack inlineSize="100%">
                  <s-stack direction="inline" justifyContent="space-between">
                    <s-stack direction="inline">
                      <s-box inlineSize="50px">
                        <s-image
                          borderRadius="base"
                          inlineSize="auto"
                          src={
                            upsell.media?.edges?.[0]?.node?.preview?.image?.url
                          }
                        />
                      </s-box>
                      <s-stack paddingInlineStart="small" gap="none">
                        <s-link
                          href={`${shopify.shop.storefrontUrl}/products/${upsell.product.handle}?variant=${IdConverter.fromShopifyIdToNumber(upsell.id)}`}
                          target="_blank"
                        >
                          {upsell.title.length > 30
                            ? upsell.title.slice(0, 30) + "..."
                            : upsell.title}
                        </s-link>
                        <s-stack
                          direction="inline"
                          gap="small"
                          justifyContent="start"
                        >
                          <s-text type="redundant" tone="critical">
                            {currencySymbol}
                            {upsell.price}
                          </s-text>
                          <s-text tone="success">
                            {currencySymbol}
                            {upsell.price}
                          </s-text>
                        </s-stack>
                      </s-stack>
                    </s-stack>
                    <s-stack direction="inline" gap="small">
                      <s-box maxInlineSize="60px">
                        <s-number-field
                          controls="none"
                          defaultValue="1"
                          onInput={(e: CallbackEvent<"s-number-field">) =>
                            handleQuantityChange(
                              upsell.id,
                              Number(e.currentTarget.value),
                            )
                          }
                          step={1}
                          min={1}
                        ></s-number-field>
                      </s-box>
                      <s-box inlineSize="50px">
                        <s-button
                          inlineSize="fill"
                          onClick={() => handleUpsell(upsell.id, isAdded)}
                          variant="primary"
                          tone={isAdded ? "critical" : "auto"}
                        >
                          <s-icon type={isAdded ? "minus" : "plus"} />
                        </s-button>
                      </s-box>
                    </s-stack>
                  </s-stack>
                </s-stack>
              </s-stack>
            );
          })}
        </s-stack>
      </s-scroll-box>
    </s-stack>
  );
}
