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
  Layout,
  TextBlock,
  TextContainer,
  View,
  extend,
} from "@shopify/post-purchase-ui-extensions";

const APP_URL = "https://knowledge-disabled-profits-clarity.trycloudflare.com";

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
  const { applyChangeset, done, storage } = input;

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

  return (
    <BlockStack spacing="loose">
      <CalloutBanner title="It's not late to add this product to your order!"></CalloutBanner>
      <Layout
        maxInlineSize={0.95}

        // media={[
        //   { viewportSize: "small", sizes: [1, 30, 1] },
        //   { viewportSize: "medium", sizes: [300, 30, 0.5] },
        //   { viewportSize: "large", sizes: [400, 30, 0.33] },
        // ]}
      >
        <View />
        <BlockStack spacing="xloose">
          <TextContainer>
            <Heading>Post-purchase extension</Heading>
            <TextBlock>
              Here you can cross-sell other products, request a product review
              based on a previous purchase, and much more.
            </TextBlock>
          </TextContainer>
          {offers.map((offer) => {
            return (
              <BlockStack>
                <Image source={offer.productImageURL} />
                <TextBlock>{offer.productTitle}</TextBlock>
                <TextBlock>{offer.productDescription}</TextBlock>
                <TextBlock>{offer.originalPrice}</TextBlock>
                <TextBlock>{offer.discountedPrice}</TextBlock>
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
              </BlockStack>
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
