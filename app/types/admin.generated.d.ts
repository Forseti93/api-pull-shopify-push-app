/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type ShopInfoQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopInfoQuery = { shop: { primaryDomain: Pick<AdminTypes.Domain, 'url'> } };

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
  media?: AdminTypes.InputMaybe<Array<AdminTypes.CreateMediaInput> | AdminTypes.CreateMediaInput>;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>> }> };

export type ProductVariantsBulkCreateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants: Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput;
}>;


export type ProductVariantsBulkCreateMutation = { productVariantsBulkCreate?: AdminTypes.Maybe<{ productVariants?: AdminTypes.Maybe<Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'sku'>>>, userErrors: Array<Pick<AdminTypes.ProductVariantsBulkCreateUserError, 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n      query ShopInfo {\n        shop {\n          primaryDomain {\n            url\n          }\n        }\n      }": {return: ShopInfoQuery, variables: ShopInfoQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n     mutation populateProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {\n        productCreate(product: $product, media: $media) {\n          product {\n            id\n            title\n            handle\n            status\n          }\n        }\n      }": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "#graphql\n      mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {\n        productVariantsBulkCreate(productId: $productId, variants: $variants) {\n          productVariants {\n            id\n            price\n            sku\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }": {return: ProductVariantsBulkCreateMutation, variables: ProductVariantsBulkCreateMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
