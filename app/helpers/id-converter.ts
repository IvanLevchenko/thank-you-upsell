export enum ShopifyEntity {
  Product = "Product",
  ProductVariant = "ProductVariant",
}

export class IdConverter {
  static fromNumberToShopifyId(
    number: number | string,
    entity: ShopifyEntity = ShopifyEntity.Product,
  ) {
    if (typeof number === "string" && number.startsWith("gid://shopify/")) {
      return number;
    }
    return `gid://shopify/${entity}/${number}`;
  }

  static fromShopifyIdToNumber(id: string): number {
    return parseInt(id.split("/").pop() || "0");
  }
}
