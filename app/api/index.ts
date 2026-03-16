import { ProductUpsell } from "@prisma/client";

import { MetafieldSetDto } from "@/mutations/metafield/set-metafield";
import { ProductRefreshDto } from "@/routes/api.upsells.$id.refresh";
import { DefaultResponse } from "@/types/default-response";
import { ProductVariant } from "@/types/product-variant";
import { getVariant } from "@/queries/variant/get-variant";
import { IdConverter } from "@/helpers/id-converter";

export class Api {
  public static products = {
    async metafieldsSet<T = any>(
      productId: string,
      dto: MetafieldSetDto,
    ): Promise<DefaultResponse<T>> {
      try {
        const response = await fetch(
          `/api/products/${productId}/metafields-set`,
          {
            method: "POST",
            body: JSON.stringify(dto),
          },
        );

        const data = await response.json();

        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to set metafields",
          details: error,
        };
      }
    },

    async metafieldVariants(
      productId: string,
    ): Promise<DefaultResponse<ProductVariant[]>> {
      try {
        const response = await fetch(
          `/api/products/${productId}/metafield-variants`,
        );
        const variants = (await response.json()) as ProductVariant[];

        return {
          success: true,
          data: variants,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to get product upsell variants",
          details: error,
        };
      }
    },
  };

  public static upsells = {
    async refresh(
      productId: string,
      dto: ProductRefreshDto,
    ): Promise<DefaultResponse<ProductUpsell>> {
      try {
        const response = await fetch(`/api/upsells/${productId}/refresh`, {
          method: "POST",
          body: JSON.stringify(dto),
        });
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (e) {
        return {
          success: false,
          error: "Failed to refresh product upsell",
          details: e,
        };
      }
    },
  };
}
