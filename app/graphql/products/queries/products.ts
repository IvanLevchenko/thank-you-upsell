export const products = `
  query Products {
    products(first: 50) {
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
