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
import { PRODUCT_CREATE_MUTATION } from "/app/graphql/mutations/productCreate.js";
import { PUBLICATIONS_QUERY } from "../graphql/queries/publications.js";
import { PUBLISHABLE_PUBLISH_MUTATION } from "../graphql/mutations/publishablePublish.js";

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

  const publicationsResponse = await admin.graphql(PUBLICATIONS_QUERY);
  const publicationsResponseJson = await publicationsResponse.json();
  const publications = publicationsResponseJson.data.publications.edges;
  const onlineStorePublication = publications.find(
    (publication) => publication.node.name === "Online Store",
  );
  const onlineStorePublicationId = onlineStorePublication?.node.id;

  return { shopDomainUrl, onlineStorePublicationId };
};

export const action = async ({ request }) => {
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const productToFetchId = formData.get("productToFetchId");
  const onlineStorePublicationId = formData.get("onlineStorePublicationId");

  const fakeStoreResponse = await fetch(
    `https://fakestoreapi.com/products/${productToFetchId}`,
  );
  if (!fakeStoreResponse.ok) {
    return { error: "Failed to fetch product from Fake Store API." };
  }
  const externalProduct = await fakeStoreResponse.json();

  const productCreateResponse = await admin.graphql(PRODUCT_CREATE_MUTATION, {
    variables: {
      product: {
        title: externalProduct.title,
        descriptionHtml: externalProduct.description,
        productType: externalProduct.category,
        vendor: "Fake Store API",
        status: "ACTIVE",
      },
      media: [
        {
          mediaContentType: "IMAGE",
          originalSource: externalProduct.image,
        },
      ],
    },
  });
  const productCreateResponseJson = await productCreateResponse.json();
  const product = productCreateResponseJson.data.productCreate.product;

  if (product) {
    await admin.graphql(PUBLISHABLE_PUBLISH_MUTATION, {
      variables: {
        id: product.id,
        input: [{ publicationId: onlineStorePublicationId }],
      },
    });
  }

  return {
    product: product,
  };
};

export default function Index() {
  const { shopDomainUrl } = useLoaderData();
  const [rangeValue, setRangeValue] = useState(1);
  const handleRangeSliderChange = useCallback(
    (value) => setRangeValue(value),
    [],
  );
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

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  const fetchProduct = () => {
    const formData = new FormData();

    formData.append("productToFetchId", rangeValue);

    fetcher.submit(formData, { method: "POST" });
  };

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
