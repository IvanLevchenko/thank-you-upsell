export enum ShopifyEntity {
  Product = "Product",
  ProductVariant = "ProductVariant",
}

export const fromNumberToShopifyId = (
  number: number | string,
  entity: ShopifyEntity = ShopifyEntity.Product,
) => {
  if (typeof number === "string" && number.startsWith("gid://shopify/")) {
    return number;
  }
  return `gid://shopify/${entity}/${number}`;
};
