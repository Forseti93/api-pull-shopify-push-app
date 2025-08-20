export const PRODUCT_CREATE_MUTATION = `#graphql
  mutation populateProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
      product {
        id
        title
        handle
        status
      }
    }
  }
`;
