import { UpsellVariantsMetafield } from "@/utils/constants";

export const product = (namespace: string, key: string) => `
  query Product($id: ID!) {
    product(id: $id) {
      id
      title
      metafield(namespace: "${namespace}", key: "${key}") {
        value
      }
      collections(first: 20) {
        edges {
          node {
            id
            title
          }
        }
      }
      media(first: 1) {
        edges {
          node {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const productWithMetafield = (
  namespace: string = UpsellVariantsMetafield.namespace,
  key: string = UpsellVariantsMetafield.key,
) => `
  query ProductWithMetafield($id: ID!) {
    product(id: $id) {
      id
      title
      metafield(namespace: "${namespace}", key: "${key}") {
        value
      }
    }
  }
`;
