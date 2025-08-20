export const PUBLICATIONS_QUERY = `#graphql
  query publications {
    publications(first: 5) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
