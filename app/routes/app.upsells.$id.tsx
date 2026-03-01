import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from "react-router";
import { useEffect, useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { UpsellMode } from "@prisma/client";

import { getProduct } from "@/queries/product/get-product";
import { IdConverter } from "@/helpers/id-converter";
import { getShop } from "@/queries/shop/get-shop";
import { getVariantsFromMetafield } from "@/queries/variant/get-variants-from-metafield";
import { getProductUrl } from "@/helpers/get-product-url";
import { MetafieldList } from "@/components/upsell/metafield-list";
import { CollectionSelector } from "@/components/upsell/collection-selector";
import { getCollections } from "@/queries/collection/get-collections";
import { ConfirmModal } from "@/components/general/confirm-modal";
import { authenticate } from "@/shopify.server";
import { Api } from "@/api";
import {
  UpsellVariantsMetafield,
  REMOVE_VARIANT_FROM_UPSELL_MODAL_ID,
} from "@/utils/constants";
import UpsellDao from "@/dao/upsell";
import { ProductRefreshDto } from "@/routes/api.upsells.$id.refresh";
import { ProductVariant } from "@/types/product-variant";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    return {};
  }

  const product = await getProduct(
    request,
    IdConverter.fromNumberToShopifyId(id),
  );
  const metafieldVariants = product.metafield?.value
    ? await getVariantsFromMetafield(request, product.metafield.value)
    : [];
  const collections = await getCollections(request);
  const shop = await getShop(request);
  const upsell = await UpsellDao.getByProductId(
    IdConverter.fromNumberToShopifyId(id),
  );

  return { metafieldVariants, collections, shop, upsell };
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

const SAVE_UPSELL_BAR = "SAVE_UPSELL_BAR";

function Upsell() {
  const appBridge = useAppBridge();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { id } = useParams();
  const { metafieldVariants, collections, shop, upsell } =
    useLoaderData<typeof loader>();

  const [variantToRemove, setVariantToRemove] = useState<string | null>(null);

  const [mode, setMode] = useState<UpsellMode>(
    upsell?.mode || UpsellMode.Metafield,
  );
  const [enabled, setEnabled] = useState<boolean>(upsell?.enabled ?? true);
  const [collectionId, setCollectionId] = useState<string | null>(
    upsell?.collectionId || null,
  );
  const [upsellVariants, setUpsellVariants] = useState<ProductVariant[]>(
    metafieldVariants || [],
  );

  const productUrl = getProductUrl(
    shop?.myshopifyDomain?.split?.(".")?.[0] || "",
    id || "",
  );

  const handleBack = () => {
    appBridge.saveBar.leaveConfirmation().then(() => navigate("/app"));
  };

  const handleEdit = () => {
    if (!shop?.myshopifyDomain) {
      return;
    }

    window.open(productUrl);
  };

  const handleModeChange = async (event: CallbackEvent<"s-choice-list">) => {
    appBridge.saveBar.show(SAVE_UPSELL_BAR);

    const mode =
      event.currentTarget.values[0] === UpsellMode.Metafield
        ? UpsellMode.Metafield
        : UpsellMode.SelectedCollection;

    setCollectionId(null);
    setMode(mode);
  };

  const handleEnabled = async () => {
    appBridge.saveBar.show(SAVE_UPSELL_BAR);

    setEnabled(!enabled);
  };

  const handleConfirmRemoveVariant = async () => {
    if (!id || !metafieldVariants) {
      return;
    }

    const variants = metafieldVariants.filter((v) => v.id !== variantToRemove);
    const variantsIds = variants.map((v) => v.id);

    await Api.metafieldsSet({
      ownerId: IdConverter.fromNumberToShopifyId(id),
      type: "list.variant_reference",
      namespace: UpsellVariantsMetafield.namespace,
      key: UpsellVariantsMetafield.key,
      value: JSON.stringify(variantsIds),
    });

    appBridge.toast.show("Variant removed from upsell");
    revalidator.revalidate();
  };

  const handleAddVariants = () => {
    revalidator.revalidate();
  };

  const handleSelectVariantToRemove = (variantId: string) => {
    setVariantToRemove(variantId);
    revalidator.revalidate();
  };

  const handleSave = async () => {
    appBridge.saveBar.hide(SAVE_UPSELL_BAR);

    if (id) {
      const dto: ProductRefreshDto = {
        mode,
        enabled,
      };

      if (collectionId) {
        dto.collectionId = collectionId;
      }

      const { success } = await Api.refreshProductUpsell(id, dto);

      appBridge.toast.show(
        success
          ? "Upsell settings saved successfully"
          : "Failed to save upsell settings",
      );

      if (success) {
        navigate(`/app/upsells`);
      }
    }
  };

  const handleDiscardSave = () => {
    appBridge.saveBar.hide(SAVE_UPSELL_BAR);

    setMode(upsell?.mode || UpsellMode.Metafield);
    setEnabled(upsell?.enabled ?? true);
    setCollectionId(upsell?.collectionId || null);
  };

  const handleCollectionChange = (collectionId: string) => {
    appBridge.saveBar.show(SAVE_UPSELL_BAR);
    setCollectionId(collectionId);
  };

  useEffect(() => {
    setUpsellVariants(metafieldVariants || []);
  }, [metafieldVariants]);

  return (
    <s-page heading={upsell?.title}>
      <SaveBar id={SAVE_UPSELL_BAR}>
        <button variant="primary" onClick={handleSave}></button>
        <button onClick={handleDiscardSave}></button>
      </SaveBar>
      <ConfirmModal
        heading="Remove variant from upsell"
        paragraph="Are you sure you want to remove this variant from the upsell?"
        modalId={REMOVE_VARIANT_FROM_UPSELL_MODAL_ID}
        onConfirm={handleConfirmRemoveVariant}
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
              <s-image src={upsell?.image || ""} alt={upsell?.title} />
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
                onChange={handleEnabled}
                checked={enabled}
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
                <s-choice
                  value={UpsellMode.Metafield}
                  selected={mode === UpsellMode.Metafield}
                >
                  <s-text>Metafield</s-text>
                </s-choice>
                <s-choice
                  value={UpsellMode.SelectedCollection}
                  selected={mode === UpsellMode.SelectedCollection}
                >
                  <s-text>Selected collection</s-text>
                </s-choice>
              </s-choice-list>
            </s-stack>

            <br />
            <s-divider />
            <br />

            <CollectionSelector
              collections={collections}
              selectedCollectionId={collectionId || ""}
              isDisabled={mode !== UpsellMode.SelectedCollection}
              onChange={handleCollectionChange}
            />

            <br />
            <s-divider />
            <br />

            <MetafieldList
              variants={upsellVariants}
              disabled={mode !== UpsellMode.Metafield}
              myShopifyDomain={shop?.myshopifyDomain || ""}
              onAddVariants={handleAddVariants}
              onSelectVariantToRemove={handleSelectVariantToRemove}
              productId={id || ""}
            />
          </s-stack>
        </s-grid>
      </s-section>
    </s-page>
  );
}

export default Upsell;
