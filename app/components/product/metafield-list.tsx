import { useAppBridge } from "@shopify/app-bridge-react";
import { ProductVariant as AppBridgeProductVariant } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

import { getProductUrl } from "@/helpers/get-product-url";
import { MetafieldSetDto } from "@/mutations/metafield/set-metafield";
import { ProductVariant } from "@/types/product-variant";
import { IdConverter, ShopifyEntity } from "@/helpers/id-converter";
import {
  UpsellVariantsMetafield,
  REMOVE_VARIANT_FROM_UPSELL_MODAL_ID,
} from "@/utils/constants";

type MetafieldListProps = {
  variants?: ProductVariant[];
  myShopifyDomain?: string;
  onAddVariants: () => void;
  onSelectVariantToRemove: (variantId: string) => void;
  productId: string;
  disabled: boolean;
};

export const MetafieldList = ({
  variants,
  myShopifyDomain,
  onAddVariants,
  onSelectVariantToRemove,
  productId,
  disabled,
}: MetafieldListProps) => {
  const appBridge = useAppBridge();
  const [variantsList, setVariantsList] = useState<
    ProductVariant[] | AppBridgeProductVariant[]
  >(variants || []);

  const setMatafields = async (
    variants: ProductVariant[] | AppBridgeProductVariant[],
  ) => {
    const variantIds = variants.map((v) => v.id);

    const dto: MetafieldSetDto = {
      ownerId: IdConverter.fromNumberToShopifyId(productId),
      type: "list.variant_reference",
      namespace: UpsellVariantsMetafield.namespace,
      key: UpsellVariantsMetafield.key,
      value: JSON.stringify(variantIds),
    };
    try {
      const response = await fetch(`/api/metafields-set`, {
        method: "POST",
        body: JSON.stringify(dto),
      });

      if (response.ok) {
        appBridge.toast.show("Metafields set successfully");

        // setVariantsList(variants);
        onAddVariants();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenSearch = async () => {
    const variantIdsFromMetafield = (await (
      await fetch(
        `/api/products/variants-from-product-metafield?id=${productId}`,
      )
    ).json()) as string[];
    const variants = variantIdsFromMetafield.length
      ? ((await (
          await fetch(`/api/variants?ids=${variantIdsFromMetafield.join(",")}`)
        ).json()) as ProductVariant[])
      : [];

    const variantsProductsMap: Record<string, string[]> = {};
    variants.forEach((variant) => {
      if (variantsProductsMap[variant.product.id]) {
        variantsProductsMap[variant.product.id].push(variant.id);
      } else {
        variantsProductsMap[variant.product.id] = [variant.id];
      }
    });

    const result =
      (await appBridge.resourcePicker({
        type: "variant",
        multiple: true,
        selectionIds: Object.entries(variantsProductsMap).map(
          ([productId, variantIds]) => ({
            id: productId,
            variants: variantIds.map((id) => ({ id })),
          }),
        ),
      })) || [];
    const variantsToAdd = result.filter((variant) => variant.id);

    setMatafields(variantsToAdd);
  };

  useEffect(() => {
    setVariantsList(variants || []);
  }, [variants]);

  return (
    <s-section
      padding="none"
      heading="Metafield variants"
      accessibilityLabel="Metafield variants table section"
    >
      <s-table>
        <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
          <s-button
            icon="plus"
            variant="secondary"
            interestFor="add-variant-tooltip"
            disabled={disabled}
            onClick={handleOpenSearch}
          ></s-button>
          <s-tooltip id="add-variant-tooltip">
            <s-text>Add a variant</s-text>
          </s-tooltip>
        </s-grid>
        <s-table-header-row>
          <s-table-header listSlot="primary">Variant</s-table-header>
          <s-table-header listSlot="secondary">Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {variantsList.map((variant) => {
            const productId = variant.product?.id?.split("/").pop();
            const shopifyAdminDomain = myShopifyDomain?.split(".")[0];

            const variantUrl = getProductUrl(shopifyAdminDomain, productId);
            return (
              <s-table-row key={variant.id}>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <s-tooltip id="delete-variant-tooltip">
                      <s-paragraph>Remove variant from upsell</s-paragraph>
                    </s-tooltip>
                    <s-button
                      icon="delete"
                      variant="secondary"
                      interestFor="delete-variant-tooltip"
                      disabled={disabled}
                      onClick={() =>
                        onSelectVariantToRemove(
                          IdConverter.fromNumberToShopifyId(
                            variant.id,
                            ShopifyEntity.ProductVariant,
                          ),
                        )
                      }
                      commandFor={REMOVE_VARIANT_FROM_UPSELL_MODAL_ID}
                    ></s-button>
                    <s-clickable
                      href=""
                      border="base"
                      borderRadius="base"
                      overflow="hidden"
                      inlineSize="40px"
                      blockSize="40px"
                    >
                      <s-image
                        objectFit="cover"
                        src={
                          (variant as ProductVariant)?.media?.edges[0]?.node
                            ?.preview?.image?.url ||
                          (variant as AppBridgeProductVariant)?.image
                            ?.originalSrc
                        }
                      />
                    </s-clickable>
                    <s-link href={variantUrl}>{variant.title}</s-link>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    {/* <s-switch defaultChecked></s-switch> */}
                    <s-badge
                      color="base"
                      tone={disabled ? "warning" : "success"}
                    >
                      {disabled ? "Inactive" : "Active"}
                    </s-badge>
                  </s-stack>
                </s-table-cell>
              </s-table-row>
            );
          })}
        </s-table-body>
      </s-table>
    </s-section>
  );
};
