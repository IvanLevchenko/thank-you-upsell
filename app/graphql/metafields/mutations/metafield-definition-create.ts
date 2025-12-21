export const metafieldDefinitionCreate = `
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      name
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;
