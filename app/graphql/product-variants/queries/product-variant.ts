export const productVariant = `
  query ProductVariant($id: ID!) {
    variant: productVariant(id: $id) {
      id
      title
      product {
        id
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
