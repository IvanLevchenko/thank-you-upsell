import { CallbackEvent } from "@shopify/polaris-types";

import { Collection } from "@/types/collection";

type CollectionSelectorProps = {
  collections?: Collection[];
  isDisabled: boolean;
  selectedCollectionId: string;
  onChange: (collectionId: string) => void;
};

export const CollectionSelector = ({
  collections,
  isDisabled,
  selectedCollectionId,
  onChange,
}: CollectionSelectorProps) => {
  return (
    <s-section heading="Selected collection">
      <s-stack>
        <s-select
          disabled={isDisabled}
          label="Collection name"
          onChange={(e: CallbackEvent<"s-select">) =>
            onChange(e.currentTarget.value)
          }
        >
          {(collections || []).map((collection) => (
            <s-option
              key={collection.id}
              value={collection.id}
              selected={selectedCollectionId === collection.id}
            >
              {collection.title}
            </s-option>
          ))}
        </s-select>
      </s-stack>
    </s-section>
  );
};
