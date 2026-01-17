import { MetafieldSetDto } from "@/mutations/metafield/set-metafield";
import { DefaultResponse } from "@/types/default-response";

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
}
