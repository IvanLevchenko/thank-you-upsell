export const productVariants = `
  query ProductVariantsList($title: String!) {
    productVariants(first: 20, query: "title:$title") {
      nodes {
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
  }
`;
