export type Noticias = {
  id: string;
  title: string;
  slug: string;
  excerpt?: {
    html: string;
  };
  coverImage?: {
    url: string;
  };
  content?: {
    html: string;
  };
  createdAt: string; // pode ser Date se você quiser transformar depois
};
