import { UpsellFilter } from "@/types/upsell-filter";

export const products = (filter: UpsellFilter = {}) => `
  query Products {
    products(first: 100${filter.title ? `, query: "title:${filter.title}*"` : ""}) {
      edges {
        node {
          id
          title
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
