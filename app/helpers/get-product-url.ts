export const getProductUrl = (myshopifyDomain?: string, id?: string) => {
  if (!myshopifyDomain || !id) {
    return "";
  }

  return `https://admin.shopify.com/store/${myshopifyDomain}/products/${id}`;
};
