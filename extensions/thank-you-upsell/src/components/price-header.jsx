import {
  TextContainer,
  Text,
} from "@shopify/post-purchase-ui-extensions-react";
import { formatCurrency } from "../helpers/format-currency";

function PriceHeader({ discountedPrice, originalPrice, loading = false }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text role="deletion" size="large">
        {!loading && formatCurrency(originalPrice)}
      </Text>
      <Text emphasized size="large" appearance="critical">
        {" "}
        {!loading && formatCurrency(discountedPrice)}
      </Text>
    </TextContainer>
  );
}

export default PriceHeader;
