import { CountryRanking, GlobalEmissionsResponse, SectorBreakdownResponse, SectorSummary } from './climateTypes'

export class ClimateTraceService {
    private baseUrl = 'https://api.climatetrace.org/v7'
    private cachedGlobalEmissions: number | null = null
    private cachedCountryRankings: CountryRanking[] | null = null
    private cachedCountrySectors: Map<string, SectorSummary[]> = new Map()

    /**
     * Fetches global CO2 emissions for 2024.
     */
    async fetchGlobalEmissions(): Promise<number> {
        if (this.cachedGlobalEmissions !== null) {
            return this.cachedGlobalEmissions
        }

        try {
            const response = await fetch(`${this.baseUrl}/sources/emissions?year=2025&gas=co2e_100yr`)
            const data: GlobalEmissionsResponse = await response.json()
            
            if (data.totals && data.totals.summaries && data.totals.summaries.length > 0) {
                this.cachedGlobalEmissions = data.totals.summaries[0].emissionsQuantity
                return this.cachedGlobalEmissions
            }
            throw new Error('Unexpected global emissions response structure')
        } catch (error) {
            console.error('Error fetching global emissions from Climate TRACE:', error)
            throw error
        }
    }

    /**
     * Fetches country rankings for CO2 emissions for 2024.
     */
    async fetchCountryRankings(): Promise<CountryRanking[]> {
        if (this.cachedCountryRankings !== null) {
            return this.cachedCountryRankings
        }

        try {
            const response = await fetch(`${this.baseUrl}/rankings/countries?gas=co2e_100yr&start=2025-01-01&end=2025-12-31`)
            const data: { rankings: CountryRanking[] } = await response.json()
            
            if (data.rankings) {
                this.cachedCountryRankings = data.rankings
                return this.cachedCountryRankings
            }
            throw new Error('Unexpected country rankings response structure')
        } catch (error) {
            console.error('Error fetching country rankings from Climate TRACE:', error)
            throw error
        }
    }

    /**
     * Fetches sector breakdown for a specific country for 2024.
     */
    async fetchCountrySectors(countryGadmId: string): Promise<SectorSummary[]> {
        if (this.cachedCountrySectors.has(countryGadmId)) {
            return this.cachedCountrySectors.get(countryGadmId)!
        }

        try {
            const response = await fetch(`${this.baseUrl}/sources/emissions?year=2025&gas=co2e_100yr&gadmId=${countryGadmId}`)
            const data: SectorBreakdownResponse = await response.json()
            
            if (data.sectors && data.sectors.summaries) {
                this.cachedCountrySectors.set(countryGadmId, data.sectors.summaries)
                return data.sectors.summaries
            }
            throw new Error('Unexpected country sector response structure')
        } catch (error) {
            console.error(`Error fetching sectors for country ${countryGadmId} from Climate TRACE:`, error)
            throw error
        }
    }

    /**
     * Formats large numbers intelligently (e.g. 37.8B, 950M).
     */
    static formatLargeNumber(value: number): string {
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(1) + 'B'
        } else if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(1) + 'M'
        } else if (value >= 1_000) {
            return (value / 1_000).toFixed(1) + 'K'
        }
        return value.toFixed(1)
    }

    /**
     * Maps API sector names to human-friendly display names.
     */
    static getFriendlySectorName(apiSector: string): string {
        const sectorMap: Record<string, string> = {
            'manufacturing': 'Manufacturing',
            'mineral-extraction': 'Mineral Extraction',
            'waste': 'Waste',
            'power': 'Power',
            'fluorinated-gases': 'Fluorinated Gases',
            'buildings': 'Buildings',
            'fossil-fuel-operations': 'Fossil Fuel Ops',
            'agriculture': 'Agriculture',
            'transportation': 'Transportation',
            'forestry-and-land-use': 'Forestry & Land Use'
        }
        return sectorMap[apiSector] || apiSector
    }
}
