import { getProductUrl } from "@/helpers/get-product-url";
import { ProductVariant } from "@/types/product-variant";
import { ConfirmModal } from "../general/confirm-modal";

type MetafieldListProps = {
  variants?: ProductVariant[];
  myShopifyDomain?: string;
  removeVariantFromUpsellModalId: string;
};

export const MetafieldList = ({
  variants,
  myShopifyDomain,
  removeVariantFromUpsellModalId,
}: MetafieldListProps) => {
  return (
    <s-section
      padding="none"
      heading="Metafield variants"
      accessibilityLabel="Metafield variants table section"
    >
      <s-table>
        <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
          <s-text-field
            label="Search variants"
            labelAccessibilityVisibility="exclusive"
            icon="search"
            placeholder="Add a variant"
          />
          <s-button
            icon="sort"
            variant="secondary"
            accessibilityLabel="Sort"
            interestFor="sort-tooltip"
            commandFor="sort-actions"
          />
          <s-tooltip id="sort-tooltip">
            <s-text>Sort</s-text>
          </s-tooltip>
          <s-popover id="sort-actions">
            <s-stack gap="none">
              <s-box padding="small">
                <s-choice-list label="Sort by" name="Sort by">
                  <s-choice value="puzzle-name" selected>
                    Puzzle name
                  </s-choice>
                  <s-choice value="pieces">Pieces</s-choice>
                  <s-choice value="created">Created</s-choice>
                  <s-choice value="status">Status</s-choice>
                </s-choice-list>
              </s-box>
              <s-divider />
              <s-box padding="small">
                <s-choice-list label="Order by" name="Order by">
                  <s-choice value="product-title" selected>
                    A-Z
                  </s-choice>
                  <s-choice value="created">Z-A</s-choice>
                </s-choice-list>
              </s-box>
            </s-stack>
          </s-popover>
        </s-grid>
        <s-table-header-row>
          <s-table-header listSlot="primary">Variant</s-table-header>
          <s-table-header listSlot="secondary">Status</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {(variants || []).map((variant) => {
            const variantId = variant.product.id.split("/").pop();
            const shopifyAdminDomain = myShopifyDomain?.split(".")[0];

            const variantUrl = getProductUrl(shopifyAdminDomain, variantId);
            return (
              <>
                <s-table-row>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-tooltip id="delete-variant-tooltip">
                        <s-paragraph>Remove variant from upsell</s-paragraph>
                      </s-tooltip>
                      <s-button
                        icon="delete"
                        variant="secondary"
                        interestFor="delete-variant-tooltip"
                        commandFor={removeVariantFromUpsellModalId}
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
                            variant.media?.edges[0]?.node?.preview?.image?.url
                          }
                        />
                      </s-clickable>
                      <s-link href={variantUrl}>{variant.title}</s-link>
                    </s-stack>
                  </s-table-cell>
                  <s-table-cell>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-switch defaultChecked></s-switch>
                      <s-badge color="base" tone="success">
                        Active
                      </s-badge>
                    </s-stack>
                  </s-table-cell>
                </s-table-row>
              </>
            );
          })}
        </s-table-body>
      </s-table>
    </s-section>
  );
};
