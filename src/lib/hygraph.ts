import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_API_URL!; // coloque sua URL da API aqui
const token = process.env.NEXT_PUBLIC_HYGRAPH_TOKEN!;      // token que você gerou

export const hygraphClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
