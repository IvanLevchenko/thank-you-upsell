import {
  TextBlock,
  TextContainer,
  Tiles,
} from "@shopify/post-purchase-ui-extensions-react";
import { formatCurrency } from "../helpers/format-currency";

function MoneySummary({ label = "Total", amount }) {
  return (
    <Tiles>
      <TextBlock size="medium" emphasized>
        {label}
      </TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="medium">
          {formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

export default MoneySummary;
