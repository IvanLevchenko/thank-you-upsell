export const collections = `
  query Collections {
    collections(first: 100) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;
