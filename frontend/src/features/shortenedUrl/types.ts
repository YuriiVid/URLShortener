export interface ShortenedUrl {
  id: number;
  longUrl: string;
  shortUrl: string;
  userId: number;
}

export interface FullShortenedUrl {
  id: number;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateShortenedUrl {
  longUrl: string;
}
