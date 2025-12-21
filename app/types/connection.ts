export type Connection<T> = {
  edges: {
    node: T;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
};
