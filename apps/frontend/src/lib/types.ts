// Company interface matching the backend Company model
export interface Company {
    id: string;
    name: string;
    description?: string;
    slug: string;
    domains: string[];
    categories: string[];
    crawl_base_urls: string[];
}

// MetaSummary interfaces for the privacy analysis
export interface MetaSummaryScore {
    score: number;
    justification: string;
}

export interface MetaSummaryScores {
    transparency: MetaSummaryScore;
    data_usage: MetaSummaryScore;
    control_and_rights: MetaSummaryScore;
    third_party_sharing: MetaSummaryScore;
}

export interface MetaSummary {
    summary: string;
    scores: MetaSummaryScores;
    keypoints: string[];
}

// Message interface for chat
export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}
