import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_API_URL!;
const token = process.env.NEXT_PUBLIC_HYGRAPH_TOKEN!;
export const hygraphClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

