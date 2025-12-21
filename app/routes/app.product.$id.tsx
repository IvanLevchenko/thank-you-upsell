import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router";
import { getProduct } from "@/queries/product/get-product";
import { fromNumberToShopifyId } from "@/helpers/from-number-to-shopify-id";
import { getShop } from "@/queries/shop/get-shop";
import { UpsellMode } from "@/enums/upsell-mode";
import { getVariantsFromMetafield } from "@/queries/variant/get-variants-from-metafield";
import type { Product } from "@/types/product";
import { getProductUrl } from "@/helpers/get-product-url";
import { MetafieldList } from "@/components/product/metafield-list";
import { CollectionSelector } from "@/components/product/collection-selector";
import { getCollections } from "@/queries/collection/get-collections";
import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";
import { ConfirmModal } from "@/components/general/confirm-modal";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    return { product: null };
  }

  const product = await getProduct(request, fromNumberToShopifyId(id));
  const metafieldVariants = await getVariantsFromMetafield(
    request,
    product.metafield.value,
  );
  const collections = await getCollections(request);
  const shop = await getShop(request);

  return { product, metafieldVariants, collections, shop };
};

const settingDetails = Object.freeze({
  upsellEnabled:
    "If upsell is disabled, the product will not be shown as the post purchase recommendation.",
  upsellMode: (
    <>
      <s-paragraph>
        <b>Metafield:</b> The upsell recommendation will be displayed based on
        the metafield value.
      </s-paragraph>
      <s-paragraph>
        <b>Selected collection:</b> The upsell recommendation will display a
        random product from the selected collection.
      </s-paragraph>
    </>
  ),
});

function Product() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { product, metafieldVariants, collections, shop } =
    useLoaderData<typeof loader>();

  const [mode, setMode] = useState<UpsellMode>(UpsellMode.Metafield);

  const productUrl = getProductUrl(
    shop?.myshopifyDomain?.split?.(".")?.[0] || "",
    id || "",
  );
  const REMOVE_VARIANT_FROM_UPSELL_MODAL_ID = "remove-variant-from-upsell";

  const handleBack = () => {
    navigate("/app");
  };

  const handleEdit = () => {
    if (!shop?.myshopifyDomain) {
      return;
    }

    window.open(productUrl);
  };

  const handleModeChange = (event: CallbackEvent<"s-choice-list">) => {
    setMode(event.currentTarget.values[0] as UpsellMode);
  };

  return (
    <s-page heading={product?.title}>
      <ConfirmModal
        heading="Remove variant from upsell"
        paragraph="Are you sure you want to remove this variant from the upsell?"
        modalId={REMOVE_VARIANT_FROM_UPSELL_MODAL_ID}
        onConfirm={() => {}}
      />
      <s-stack justifyContent="space-between" direction="inline">
        <s-button variant="primary" onClick={handleBack}>
          Back
        </s-button>
        <s-button icon="edit" onClick={handleEdit}>
          Edit product
        </s-button>
      </s-stack>
      <br />
      <br />
      <s-section heading="Settings" padding="base">
        <s-grid gridTemplateColumns="1fr 2fr">
          <s-stack alignItems="start">
            <s-box blockSize="300px" paddingBlockStart="base">
              <s-image
                src={product?.media?.edges[0]?.node?.preview?.image?.url}
                alt={product?.title}
              />
            </s-box>
          </s-stack>
          <s-stack>
            <s-stack direction="inline" gap="small">
              <s-tooltip id="upsellEnabled">
                {settingDetails.upsellEnabled}
              </s-tooltip>
              <s-icon type="info" interestFor="upsellEnabled"></s-icon>
              <s-switch
                label="Enable upsell"
                details="Enable or disable the post purchase upsell for this product"
                defaultChecked
              ></s-switch>
            </s-stack>

            <br />
            <s-divider />
            <br />

            <s-tooltip id="upsellMode">{settingDetails.upsellMode}</s-tooltip>
            <s-stack direction="inline" gap="small">
              <s-icon type="info" interestFor="upsellMode"></s-icon>
              <s-choice-list
                label="Mode"
                details="Upsell recommendation mode"
                onChange={handleModeChange}
              >
                <s-choice value={UpsellMode.Metafield} defaultSelected>
                  <s-text>Metafield</s-text>
                </s-choice>
                <s-choice value={UpsellMode.SelectedCollection}>
                  <s-text>Selected collection</s-text>
                </s-choice>
              </s-choice-list>
            </s-stack>

            <br />
            <s-divider />
            <br />

            <CollectionSelector
              collections={collections}
              isDisabled={mode !== UpsellMode.SelectedCollection}
            />

            <br />
            <s-divider />
            <br />

            <MetafieldList
              variants={metafieldVariants}
              myShopifyDomain={shop?.myshopifyDomain || ""}
              removeVariantFromUpsellModalId={
                REMOVE_VARIANT_FROM_UPSELL_MODAL_ID
              }
            />
          </s-stack>
        </s-grid>
      </s-section>
    </s-page>
  );
}

const getSelectedCollection = () => {
  return <></>;
};

export default Product;
