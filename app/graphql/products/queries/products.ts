import { FilterQuery } from "@/types/filter-query";

export const products = (filter: FilterQuery) => `
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
