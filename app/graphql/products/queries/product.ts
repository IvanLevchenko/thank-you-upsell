export const product = `
  query Product($id: ID!) {
    product(id: $id) {
      id
      title
      metafield(namespace: "custom", key: "test") {
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
