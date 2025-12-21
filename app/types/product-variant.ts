export type ProductVariant = {
  id: string;
  title: string;
  product: {
    id: string;
  };
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
  };
};
