export type Product = {
  id: string;
  title: string;
  media: {
    edges: {
      node: {
        preview: {
          image: {
            url: string;
          };
        };
      };
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
  metafield: {
    value: string;
  };
};
