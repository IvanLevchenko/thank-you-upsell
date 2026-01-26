export type ProductVariant = {
  id: string;
  title: string;
  product: {
    id: string;
  };
  price: string;
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
