import { gql } from "graphql-request";

export const GET_POSTS = gql`
  query GetPosts {
    noticias{
        id
        title
        slug
        excerpt{
            html
        }
        coverImage{
            url
        }
        content{
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