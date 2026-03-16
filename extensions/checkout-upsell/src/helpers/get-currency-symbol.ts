export const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currencyCode;
  }
};
