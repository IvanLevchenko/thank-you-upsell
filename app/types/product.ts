export type Product = {
  id: string;
  title: string;
  handle: string;
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
