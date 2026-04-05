export interface PropertyFields {
    square_footage: string;
    bedrooms: string;
    bathrooms: string;
    year_built: string;
    lot_size: string;
    distance_to_city_center: string;
    school_rating: string;
}

export interface EstimateRecord {
    id: string;
    timestamp: string;
    details: Partial<PropertyFields> | Record<string, string>;
    result: number;
}

export interface AnalysisRecord {
    id: string;
    timestamp: string;
    propertyCount: number;
    avgValue: number;
    results: number[];
    rows: Record<string, string>[];
}

export interface MarketStats {
    totalProperties: number;
    avgPrice: number;
    avgSqft: number;
    topSegment: string;
}

export interface MarketDistribution {
    labels: string[];
    values: number[];
}
