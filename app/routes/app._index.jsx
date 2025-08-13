import { useCallback, useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  RangeSlider,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import shopify from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await shopify.authenticate.admin(request);
  const shopDomainUrlResponse = await admin.graphql(
    `#graphql
      query ShopInfo {
        shop {
          primaryDomain {
            url
          }
        }
      }`,
  );
  const shopDomainUrlResponseJson = await shopDomainUrlResponse.json();
  const shopDomainUrl = shopDomainUrlResponseJson.data.shop.primaryDomain.url;

  return { shopDomainUrl };
};

export const action = async ({ request }) => {
  const { admin } = await shopify.authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { shopDomainUrl } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );
  const shopId = shopDomainUrl
    .replace("https://", "")
    .replace(".com/", "")
    .replace(".myshopify.com", "");
  const [rangeValue, setRangeValue] = useState(32);
  const handleRangeSliderChange = useCallback(
    (value) => setRangeValue(value),
    [],
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  // const generateProduct = () => fetcher.submit({}, { method: "POST" });
  // TODO: I was replacing the generateProduct button on fetch product
  const fetchProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Fakestoreapi to store">
        <a
          variant={"primary"}
          href="https://github.com/Forseti93/products-pull-push-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          variant={"secondary"}
          href="https://shopify.dev/docs/apps/build/scaffold-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Starter guide
        </a>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Fetch a product from an external API and push in to the
                    shop's products
                  </Text>
                  <Text variant="bodyMd" as="p">
                    This embedded app will fetch a product with from{" "}
                    <Link
                      url="https://fakestoreapi.com/docs#tag/Products/operation/getProductById"
                      target="_blank"
                    >
                      the Fakestoreapi
                    </Link>{" "}
                    by the ID selected using{" "}
                    <Link
                      url="https://polaris-react.shopify.com/components/selection-and-input/range-slider"
                      target="_blank"
                    >
                      the range slider
                    </Link>{" "}
                    of{" "}
                    <Link
                      url="https://polaris-react.shopify.com/"
                      target="_blank"
                    >
                      the Polaris React
                    </Link>{" "}
                    design system. The backend uses{" "}
                    <Link url="https://remix.run/" target="_blank">
                      the Remix
                    </Link>
                    .
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <RangeSlider
                    label="Product's ID (1...20)"
                    value={rangeValue}
                    min={1}
                    max={20}
                    onChange={handleRangeSliderChange}
                    output
                  />
                  {/* <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button> */}
                  <Button loading={isLoading} onClick={fetchProduct}>
                    Fetch the product
                  </Button>
                  {fetcher.data?.product && (
                    <Button
                      url={`https://admin.shopify.com/store/${shopId}/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
