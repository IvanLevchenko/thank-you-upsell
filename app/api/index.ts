import { MetafieldSetDto } from "@/mutations/metafield/set-metafield";
import { ProductRefreshDto } from "@/routes/api.products.$id.refresh";
import { DefaultResponse } from "@/types/default-response";
import { ProductVariant } from "@/types/product-variant";

export class Api {
  static async metafieldsSet<T = any>(
    dto: MetafieldSetDto,
  ): Promise<DefaultResponse<T>> {
    try {
      const response = await fetch(`/api/metafields-set`, {
        method: "POST",
        body: JSON.stringify(dto),
      });

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
  }

  static async getProductUpsellVariants(
    request: Request,
    productId: string,
  ): Promise<DefaultResponse<ProductVariant[]>> {
    const url = new URL(
      `/api/products/${productId}/upsell-variants`,
      request.url,
    );
    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to get product upsell variants",
        details: error,
      };
    }
  }

  static async refreshProductUpsell(
    productId: string,
    dto: ProductRefreshDto,
  ): Promise<DefaultResponse> {
    try {
      const response = await fetch(`/api/products/${productId}/refresh`, {
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
  }
}
