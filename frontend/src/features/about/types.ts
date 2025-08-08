export interface AboutResponse {
  content: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface UpdateAboutRequest {
  content: string;
}
