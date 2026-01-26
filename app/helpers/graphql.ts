export const graphql = async <T>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<{ data: T }> => {
  const response = await fetch(
    `https://${shop}/admin/api/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  return response.json();
};
