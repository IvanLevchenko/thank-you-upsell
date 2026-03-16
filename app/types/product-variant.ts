export type ProductVariant = {
  id: string;
  title: string;
  product: {
    id: string;
    handle: string;
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
