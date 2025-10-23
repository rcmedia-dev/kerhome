import { gql } from "graphql-request";

export const GET_POSTS = gql`
  query GetPosts($first: Int = 10, $skip: Int = 0) {
    noticias(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      slug
      excerpt {
        html
      }
      coverImage {
        url
      }
      content {
        html
      }
      createdAt
    }
  }
`;


export const GET_POST_BY_SLUG = gql`
  query GetNoticiaBySlug($slug: String!) {
    noticia(where: { slug: $slug }) {
      id
      title
      slug
      excerpt {
        html
      }
      coverImage {
        url
      }
      content {
        html
      }
      createdAt
    }
  }
`;