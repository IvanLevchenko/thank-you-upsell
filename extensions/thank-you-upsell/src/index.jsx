import {
  render,
  useExtensionInput,
} from "@shopify/post-purchase-ui-extensions-react";
import {
  BlockStack,
  Button,
  CalloutBanner,
  Heading,
  Image,
  InlineStack,
  Layout,
  TextBlock,
  TextContainer,
  Text,
  extend,
} from "@shopify/post-purchase-ui-extensions";
import { useEffect, useState } from "react";

import PriceHeader from "./components/price-header.jsx";
import MoneySummary from "./components/money-summary.jsx";
import MoneyLine from "./components/money-line.jsx";

const APP_URL = "https://quarterly-llc-customers-feel.trycloudflare.com";

extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({ storage, inputData }) => {
    const productIds = inputData.initialPurchase.lineItems.map(
      (lineItem) => lineItem.product.id,
    );
    const referenceId = inputData.initialPurchase.referenceId;

    const offers = await fetch(`${APP_URL}/api/offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productIds,
        referenceId,
      }),
    }).then((response) => response.json());

    if (offers.success) {
      await storage.update({ ...inputData, ...offers });
    } else {
      return {
        render: false,
      };
    }

    return {
      render: true,
    };
  },
);

render("Checkout::PostPurchase::Render", (props) => (
  <App
    storage={props.storage}
    extensionPoint={props.extensionPoint}
    applyChangeset={(changeset, options) =>
      props.applyChangeset(changeset, options).then(() => props.done())
    }
    done={props.done}
  />
));

export function App() {
  const input = useExtensionInput();
  const { applyChangeset, done, storage, calculateChangeset } = input;

  const [calculatedPurchase, setCalculatedPurchase] = useState();

  const offers = storage.initialData.data;

  async function acceptOffer(apiToken, referenceId, changes) {
    const token = await fetch(`${APP_URL}/api/offer/sign-changeset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId,
        changes,
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    await applyChangeset(token);

    done();
  }

  useEffect(() => {
    console.log("calculatedPurchase 1", [
      ...offers.map((offer) => offer.changes),
    ]);
    const changeset = calculateChangeset({
      changes: [...offers.map((offer) => offer.changes)],
    });

    setCalculatedPurchase(changeset.calculatedPurchase);
  }, [offers]);

  console.log("calculatedPurchase", calculatedPurchase);
  return (
    <BlockStack spacing="loose">
      {/* <CalloutBanner
        title="It's not late to add this product to your order!"
        background="transparent"
      ></CalloutBanner> */}
      <Layout
        maxInlineSize={0.95}
        media={[
          { viewportSize: "small", sizes: [1, 30, 1] },
          { viewportSize: "medium", sizes: [300, 30, 0.5] },
          { viewportSize: "large", sizes: [1000, 30, 0.33] },
        ]}
      >
        <BlockStack spacing="xloose">
          {/* <TextContainer>
            <Heading>Post-purchase extension</Heading>
            <TextBlock>
              Here you can cross-sell other products, request a product review
              based on a previous purchase, and much more.
            </TextBlock>
          </TextContainer> */}
          {offers.map((offer, index) => {
            console.log("offer", offer);
            return (
              <InlineStack>
                <Layout maxInlineSize={200}>
                  <Image source={offer.productImageURL} />
                </Layout>
                <BlockStack padding="base">
                  <Heading level={2}>{offer.productTitle}</Heading>
                  <PriceHeader
                    originalPrice={offer.originalPrice}
                    discountedPrice={offer.discountedPrice}
                  />
                  <Text>{offer.productDescription}</Text>
                  <MoneyLine
                    label="Original price"
                    amount={offer.originalPrice}
                  />

                  <MoneyLine
                    label="Shipping"
                    amount={
                      calculatedPurchase?.updatedLineItems?.[index]?.priceSet
                        ?.presentmentMoney?.amount
                    }
                  />
                  <MoneySummary amount={offer.discountedPrice} />
                  <Layout
                    inlineAlignment="leading"
                    sizes={["auto", "auto", "fill"]}
                  >
                    <Button
                      onPress={() =>
                        acceptOffer(
                          storage.initialData.token,
                          storage.initialData.initialPurchase.referenceId,
                          offer.changes,
                        )
                      }
                    >
                      Accept Offer
                    </Button>
                  </Layout>
                </BlockStack>
              </InlineStack>
            );
          })}
          {/* <Button
            submit
            onPress={() =>
              acceptOffer(
                storage.initialData.token,
                storage.initialData.initialPurchase.referenceId,
                storage.initialData.initialPurchase.purchaseOptionId,
              )
            }
          >
            Primary button
          </Button> */}
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}
