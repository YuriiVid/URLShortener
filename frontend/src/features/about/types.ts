export interface AboutResponse {
  content: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface UpdateAboutRequest {
  content: string;
}

export interface AboutPage {
  content: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}
