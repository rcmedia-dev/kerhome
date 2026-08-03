import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_API_URL;
const token = process.env.NEXT_PUBLIC_HYGRAPH_TOKEN;

if (!endpoint) {
  console.error(
    "[Hygraph] NEXT_PUBLIC_HYGRAPH_API_URL não está definida. " +
    "Adicione esta variável de ambiente no seu painel de deploy (Vercel, etc)."
  );
}

export const hygraphClient = new GraphQLClient(
  endpoint || "https://placeholder.hygraph.com/invalid",
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
);
