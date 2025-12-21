enum ShopifyEntity {
  Product = "Product",
}

export const fromNumberToShopifyId = (
  number: number | string,
  entity: ShopifyEntity = ShopifyEntity.Product,
) => {
  return `gid://shopify/${entity}/${number}`;
};
