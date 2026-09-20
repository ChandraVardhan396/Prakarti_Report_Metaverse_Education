export interface CountryRanking {
    rank: number
    country: string // 3-letter country code
    name: string
    gas: string
    emissionsQuantity: number
    emissionsPerCapita: number
    percentage: number
}

export interface SectorSummary {
    sector: string
    gas: string
    emissionsQuantity: number
    percentage: number
}

export interface SectorBreakdownResponse {
    sectors: {
        summaries: SectorSummary[]
    }
}

export interface GlobalEmissionsResponse {
    totals: {
        summaries: {
            gas: string
            emissionsQuantity: number
            percentage: number
        }[]
    }
}
