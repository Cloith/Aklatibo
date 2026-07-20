export type LicenseMetadata = {
  name?: string;
  shortName?: string;
  url?: string;
};

export type BookDto = {
  slug: string;
  title: string;
  category?: string;
  summary?: string;
  description?: string;
  authors?: string[] | string;
  publisher?: string;
  publishDate?: string;
  license?: LicenseMetadata;
  language?: string;
  coverImageUrl?: string;
  pdfPath?: string;
  tags?: string[] | string;
};