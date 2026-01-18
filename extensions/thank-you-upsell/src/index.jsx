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

const APP_URL = "https://shareware-equipped-quantity-nyc.trycloudflare.com";
extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({ storage, inputData }) => {
    const postPurchaseOffer = await fetch(`${APP_URL}/api/offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
      }),
    }).then((response) => response.json());

    await storage.update({ ...inputData, ...postPurchaseOffer });

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
  const offer = storage.initialData.offer;

  async function acceptOffer(apiToken, referenceId, purchaseOptionId) {
    const token = await fetch(`${APP_URL}/api/offer/sign-changeset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: referenceId,
        changes: purchaseOptionId,
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
        media={[
          { viewportSize: "small", sizes: [1, 30, 1] },
          { viewportSize: "medium", sizes: [300, 30, 0.5] },
          { viewportSize: "large", sizes: [400, 30, 0.33] },
        ]}
      >
        <View>
          <Image source={offer.productImageURL} />
        </View>
        <View />
        <BlockStack spacing="xloose">
          <TextContainer>
            <Heading>Post-purchase extension</Heading>
            <TextBlock>
              Here you can cross-sell other products, request a product review
              based on a previous purchase, and much more.
            </TextBlock>
          </TextContainer>
          <Button
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
          </Button>
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}
