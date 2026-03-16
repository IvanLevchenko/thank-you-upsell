export const productVariant = `
  query ProductVariant($id: ID!) {
    variant: productVariant(id: $id) {
      id
      title
      product {
        id
        handle
      }
      price
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
