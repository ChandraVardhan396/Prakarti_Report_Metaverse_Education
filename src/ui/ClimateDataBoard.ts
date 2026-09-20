import { engine, Transform, MeshRenderer, Material, TextShape, pointerEventsSystem, InputAction, Entity, MeshCollider, TextAlignMode } from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import { ClimateTraceService } from '../climate/ClimateTraceService'
import { CountryRanking } from '../climate/climateTypes'

// Theme Colors
const BG_COLOR = Color4.create(1, 1, 1, 1) // Pure white dashboard
const PRIMARY_TEXT = Color4.create(0.1, 0.1, 0.1, 1) // Charcoal Black
const SECONDARY_TEXT = Color4.create(0.3, 0.3, 0.3, 1) // Dark Gray
const HEADER_COLOR = Color4.create(0.1, 0.45, 0.3, 1) // Dark Green
const TEAL_ACCENT = Color4.create(0.1, 0.55, 0.5, 1) // Teal for values/bars
const DIVIDER_COLOR = Color4.create(0.85, 0.88, 0.85, 1)
const CARD_BG = Color4.create(0.96, 0.97, 0.96, 1) // Light gray cards
const BUTTON_BG = Color4.create(0.9, 0.92, 0.9, 1)

export class ClimateDataBoard {
    private boardEntity: Entity
    private service: ClimateTraceService
    
    // UI Containers
    private uiContainer: Entity
    private topEmittersContainer!: Entity
    private countryButtonsContainer!: Entity
    private detailPanelContainer!: Entity
    private detailSectorsContainer!: Entity
    
    // UI Elements
    private loadingText: Entity
    private globalEmissionsValueText: Entity
    private topEmittersRows: Entity[] = []
    private countryButtons: Entity[] = []
    
    private detailCountryText: Entity
    private detailTotalText: Entity
    private sectorRows: Entity[] = []

    constructor(position: Vector3, rotation: Quaternion) {
        this.service = new ClimateTraceService()
        
        // Main Board Mesh
        this.boardEntity = engine.addEntity()
        Transform.create(this.boardEntity, {
            position,
            rotation,
            scale: Vector3.create(14, 14, 0.1) // 14m wide, 14m high
        })
        MeshRenderer.setBox(this.boardEntity)
        MeshCollider.setBox(this.boardEntity)
        Material.setPbrMaterial(this.boardEntity, {
            albedoColor: BG_COLOR,
            metallic: 0.1,
            roughness: 0.8,
            emissiveColor: Color4.create(0.1, 0.1, 0.1, 1),
            emissiveIntensity: 0.1
        })

        // Unscaled UI Container
        this.uiContainer = engine.addEntity()
        Transform.create(this.uiContainer, {
            parent: this.boardEntity,
            // CRITICAL FIX: Z=-0.52 ensures the UI sits firmly OUTSIDE the white board (front face is at -0.5)
            position: Vector3.create(0, 0, -0.52), 
            scale: Vector3.create(1/14, 1/14, 1/0.1) // Counteract the board's scale
        })
        
        this.globalEmissionsValueText = engine.addEntity()
        this.loadingText = engine.addEntity()
        this.detailCountryText = engine.addEntity()
        this.detailTotalText = engine.addEntity()

        this.createStaticLayout()
        
        // Fetch data
        this.loadData()
    }

    private createText(parent: Entity, text: string, position: Vector3, fontSize: number, color: Color4, align: TextAlignMode): Entity {
        const textEntity = engine.addEntity()
        Transform.create(textEntity, { parent, position })
        TextShape.create(textEntity, { text, fontSize, textColor: color, textAlign: align })
        return textEntity
    }

    private createDivider(parent: Entity, position: Vector3, width: number) {
        const divider = engine.addEntity()
        Transform.create(divider, { parent, position, scale: Vector3.create(width, 0.02, 0.01) })
        MeshRenderer.setBox(divider)
        Material.setPbrMaterial(divider, { albedoColor: DIVIDER_COLOR, metallic: 0.1, roughness: 1 })
    }

    private createCardBackground(parent: Entity, position: Vector3, scale: Vector3) {
        const card = engine.addEntity()
        Transform.create(card, { parent, position, scale })
        MeshRenderer.setBox(card)
        Material.setPbrMaterial(card, { albedoColor: CARD_BG, metallic: 0, roughness: 1 })
    }

    private createStaticLayout() {
        // --- BACKGROUND CARDS ---
        // Global Emissions Card
        this.createCardBackground(this.uiContainer, Vector3.create(-3.5, 3.2, 0.01), Vector3.create(5.6, 2.5, 0.01))
        // Top Emitters Card
        this.createCardBackground(this.uiContainer, Vector3.create(3.15, 2.8, 0.01), Vector3.create(6.6, 3.4, 0.01))
        // Details Card
        this.createCardBackground(this.uiContainer, Vector3.create(0, -1.8, 0.01), Vector3.create(13, 5.0, 0.01))


        // --- FOREGROUND TEXT ---
        this.createText(this.uiContainer, 'EARTH FORWARD', Vector3.create(-6.3, 6.2, 0), 3.5, HEADER_COLOR, TextAlignMode.TAM_MIDDLE_LEFT)
        this.createText(this.uiContainer, 'CLIMATE TRACE', Vector3.create(6.3, 6.2, 0), 2.0, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_RIGHT)
        this.createText(this.uiContainer, 'GLOBAL CLIMATE EMISSIONS', Vector3.create(-6.3, 5.7, 0), 2.0, PRIMARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
        
        this.createDivider(this.uiContainer, Vector3.create(0, 5.4, 0), 13)

        this.createText(this.uiContainer, 'GLOBAL EMISSIONS', Vector3.create(-6.3, 4.8, 0), 2.0, HEADER_COLOR, TextAlignMode.TAM_MIDDLE_LEFT)
        
        Transform.create(this.globalEmissionsValueText, { parent: this.uiContainer, position: Vector3.create(-3.5, 3.5, 0) })
        TextShape.create(this.globalEmissionsValueText, { text: '', fontSize: 5.5, textColor: TEAL_ACCENT, textAlign: TextAlignMode.TAM_MIDDLE_CENTER })
        
        this.createText(this.uiContainer, 'tonnes CO2e\n2025\n100-year GWP', Vector3.create(-3.5, 2.3, 0), 1.6, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_CENTER)

        Transform.create(this.loadingText, { parent: this.uiContainer, position: Vector3.create(0, 0, -0.01) })
        TextShape.create(this.loadingText, { text: 'FETCHING CLIMATE TRACE DATA...', fontSize: 3.5, textColor: HEADER_COLOR, textAlign: TextAlignMode.TAM_MIDDLE_CENTER })

        this.createText(this.uiContainer, 'TOP EMITTERS', Vector3.create(0, 4.8, 0), 2.0, HEADER_COLOR, TextAlignMode.TAM_MIDDLE_LEFT)

        this.topEmittersContainer = engine.addEntity()
        Transform.create(this.topEmittersContainer, { parent: this.uiContainer, position: Vector3.create(0, 4.1, 0) })

        this.createDivider(this.uiContainer, Vector3.create(0, 1.0, 0), 13)
        
        this.createText(this.uiContainer, 'SELECT COUNTRY', Vector3.create(-6.3, 0.4, 0), 2.0, HEADER_COLOR, TextAlignMode.TAM_MIDDLE_LEFT)

        this.countryButtonsContainer = engine.addEntity()
        Transform.create(this.countryButtonsContainer, { parent: this.uiContainer, position: Vector3.create(0, -0.4, 0) })

        this.createDivider(this.uiContainer, Vector3.create(0, -1.2, 0), 13)

        this.detailPanelContainer = engine.addEntity()
        Transform.create(this.detailPanelContainer, { parent: this.uiContainer, position: Vector3.create(0, -1.5, 0) })
        
        Transform.create(this.detailCountryText, { parent: this.detailPanelContainer, position: Vector3.create(-6.1, -0.7, 0) })
        TextShape.create(this.detailCountryText, { text: '', fontSize: 3.5, textColor: PRIMARY_TEXT, textAlign: TextAlignMode.TAM_MIDDLE_LEFT })
        
        this.createText(this.detailPanelContainer, 'TOTAL EMISSIONS', Vector3.create(-6.1, -0.1, 0), 1.6, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
        this.createText(this.detailPanelContainer, 'YEAR', Vector3.create(-1.8, -0.1, 0), 1.6, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
        this.createText(this.detailPanelContainer, '2025', Vector3.create(-1.8, -0.7, 0), 2.0, PRIMARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)

        Transform.create(this.detailTotalText, { parent: this.detailPanelContainer, position: Vector3.create(-6.1, -1.3, 0) })
        TextShape.create(this.detailTotalText, { text: '', fontSize: 3.0, textColor: TEAL_ACCENT, textAlign: TextAlignMode.TAM_MIDDLE_LEFT })
        
        this.createText(this.detailPanelContainer, 'EMISSIONS BY SECTOR', Vector3.create(-6.1, -2.1, 0), 2.0, HEADER_COLOR, TextAlignMode.TAM_MIDDLE_LEFT)

        this.detailSectorsContainer = engine.addEntity()
        Transform.create(this.detailSectorsContainer, { parent: this.detailPanelContainer, position: Vector3.create(0, -2.7, 0) })

        this.createDivider(this.uiContainer, Vector3.create(0, -6.2, 0), 13)
        this.createText(this.uiContainer, 'DATA SOURCE: CLIMATE TRACE', Vector3.create(-6.3, -6.6, 0), 1.4, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
        this.createText(this.uiContainer, 'METRIC: CO2e, 100-year GWP', Vector3.create(6.3, -6.6, 0), 1.4, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_RIGHT)
    }

    private async loadData() {
        try {
            const [globalEmissions, rankings] = await Promise.all([
                this.service.fetchGlobalEmissions(),
                this.service.fetchCountryRankings()
            ])

            TextShape.getMutable(this.loadingText).text = ''

            TextShape.getMutable(this.globalEmissionsValueText).text = `${ClimateTraceService.formatLargeNumber(globalEmissions)}`

            const top5 = rankings.slice(0, 5)
            this.renderTopEmitters(top5)
            this.renderCountryButtons(top5)

        } catch (err) {
            TextShape.getMutable(this.loadingText).text = 'UNABLE TO RETRIEVE CLIMATE DATA\nDATA SOURCE: CLIMATE TRACE'
            TextShape.getMutable(this.loadingText).textColor = Color4.Red()
        }
    }

    private renderTopEmitters(topCountries: CountryRanking[]) {
        if (topCountries.length === 0) return
        
        const maxValue = topCountries[0].emissionsQuantity

        topCountries.forEach((country, index) => {
            const rowEntity = engine.addEntity()
            Transform.create(rowEntity, {
                parent: this.topEmittersContainer,
                position: Vector3.create(0, -(index * 0.6), 0)
            })

            const prefix = (index + 1).toString().padStart(2, '0')
            this.createText(rowEntity, `${prefix}  ${country.name}`, Vector3.create(0.2, 0, 0), 1.6, PRIMARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)

            const percent = country.emissionsQuantity / maxValue
            const numBlocks = Math.max(1, Math.floor(percent * 18))
            const barString = '█'.repeat(numBlocks)

            this.createText(rowEntity, barString, Vector3.create(0.2, -0.28, 0), 1.0, TEAL_ACCENT, TextAlignMode.TAM_MIDDLE_LEFT)
            this.createText(rowEntity, `${ClimateTraceService.formatLargeNumber(country.emissionsQuantity)} tonnes CO2e`, Vector3.create(6.2, -0.28, 0), 1.4, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_RIGHT)

            this.topEmittersRows.push(rowEntity)
        })
    }

    private renderCountryButtons(countries: CountryRanking[]) {
        const startX = -5.0
        const gap = 2.5

        countries.forEach((country, index) => {
            const btnEntity = engine.addEntity()
            Transform.create(btnEntity, {
                parent: this.countryButtonsContainer,
                position: Vector3.create(startX + (index * gap), 0, 0)
            })

            MeshRenderer.setBox(btnEntity)
            MeshCollider.setBox(btnEntity)
            Material.setPbrMaterial(btnEntity, {
                albedoColor: BUTTON_BG,
                metallic: 0.1,
                roughness: 0.8
            })
            Transform.getMutable(btnEntity).scale = Vector3.create(2.2, 0.6, 0.01)

            const textEntity = engine.addEntity()
            Transform.create(textEntity, { parent: btnEntity, position: Vector3.create(0, 0, -1), scale: Vector3.create(1/2.2, 1/0.6, 1/0.01) })
            TextShape.create(textEntity, { text: country.name.toUpperCase(), fontSize: 1.6, textColor: HEADER_COLOR, textAlign: TextAlignMode.TAM_MIDDLE_CENTER })

            pointerEventsSystem.onPointerDown(
                { entity: btnEntity, opts: { hoverText: `Select ${country.name}`, button: InputAction.IA_POINTER } },
                () => {
                    this.selectCountry(country)
                }
            )

            this.countryButtons.push(btnEntity)
        })
    }

    private async selectCountry(country: CountryRanking) {
        TextShape.getMutable(this.detailCountryText).text = `FETCHING ${country.name.toUpperCase()}...`
        TextShape.getMutable(this.detailTotalText).text = ''
        
        for (const row of this.sectorRows) {
            engine.removeEntity(row)
        }
        this.sectorRows = []

        try {
            const sectors = await this.service.fetchCountrySectors(country.country)
            
            TextShape.getMutable(this.detailCountryText).text = country.name.toUpperCase()
            TextShape.getMutable(this.detailTotalText).text = `${ClimateTraceService.formatLargeNumber(country.emissionsQuantity)} tonnes CO2e`

            sectors.sort((a, b) => b.emissionsQuantity - a.emissionsQuantity)
            const topSectors = sectors.slice(0, 4)
            
            const maxSectorValue = topSectors.length > 0 ? topSectors[0].emissionsQuantity : 1

            const col1X = -6.1
            const col2X = 0.5

            topSectors.forEach((sector, index) => {
                const sectorEntity = engine.addEntity()
                const isCol2 = index % 2 !== 0
                const rowIdx = Math.floor(index / 2)
                
                const xPos = isCol2 ? col2X : col1X
                const yPos = -(rowIdx * 0.9)

                Transform.create(sectorEntity, { parent: this.detailSectorsContainer, position: Vector3.create(xPos, yPos, 0) })
                
                const percent = sector.emissionsQuantity / maxSectorValue
                const numBlocks = Math.max(1, Math.floor(percent * 15))
                const barString = '█'.repeat(numBlocks)

                const friendlyName = ClimateTraceService.getFriendlySectorName(sector.sector)

                this.createText(sectorEntity, friendlyName, Vector3.create(0, 0, 0), 1.6, PRIMARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
                this.createText(sectorEntity, barString, Vector3.create(0, -0.3, 0), 1.2, TEAL_ACCENT, TextAlignMode.TAM_MIDDLE_LEFT)
                
                this.sectorRows.push(sectorEntity)
            })
            
            if (topSectors.length === 0) {
                const emptyEntity = engine.addEntity()
                Transform.create(emptyEntity, { parent: this.detailSectorsContainer, position: Vector3.create(-6.1, 0, 0) })
                this.createText(emptyEntity, 'No sector data available', Vector3.create(0, 0, 0), 1.6, SECONDARY_TEXT, TextAlignMode.TAM_MIDDLE_LEFT)
                this.sectorRows.push(emptyEntity)
            }

        } catch (error) {
            TextShape.getMutable(this.detailCountryText).text = country.name.toUpperCase()
            TextShape.getMutable(this.detailTotalText).text = 'Sector data unavailable'
        }
    }
}
