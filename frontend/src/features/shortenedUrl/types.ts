export interface ShortenedUrlDto {
  id: number;
  longUrl: string;
  shortUrl: string;
  userId: number;
}

export interface FullShortenedUrlDto {
  id: number;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateShortenedUrlDto {
  longUrl: string;
}
