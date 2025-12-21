import { Collection } from "@/types/collection";

type CollectionSelectorProps = {
  collections?: Collection[];
  isDisabled: boolean;
};

export const CollectionSelector = ({
  collections,
  isDisabled,
}: CollectionSelectorProps) => {
  return (
    <s-section heading="Selected collection">
      <s-stack>
        <s-select disabled={isDisabled} label="Collection name">
          {(collections || []).map((collection) => (
            <s-option key={collection.id} value={collection.id}>
              {collection.title}
            </s-option>
          ))}
        </s-select>
      </s-stack>
    </s-section>
  );
};
