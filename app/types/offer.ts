export type Offer = {
  id: number;
  title: string;
  productTitle: string;
  productImageURL: string;
  productDescription: string[];
  originalPrice: string;
  discountedPrice: string;
  changes: {
    type: "add_variant";
    variantID: number;
    quantity: number;
    discount?: {
      value: number;
      valueType: "percentage" | "fixed";
      title: string;
    };
  }[];
};

export type Offers = Offer[];
