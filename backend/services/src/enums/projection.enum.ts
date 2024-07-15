export enum ProjectionType {
    WITH_MEASURES = "With Measures",
    WITH_ADDITIONAL_MEASURES = "With Additional Measures",
    WITHOUT_MEASURES = "Without Measures",
}

export enum ExtendedProjectionType {
    WITH_MEASURES = "With Measures",
    WITH_ADDITIONAL_MEASURES = "With Additional Measures",
    WITHOUT_MEASURES = "Without Measures",
    BASELINE_WITH_MEASURES = "Baseline with Measures",
    BASELINE_WITH_ADDITIONAL_MEASURES = "Baseline with Additional Measures",
    BASELINE_WITHOUT_MEASURES = "Baseline without Measures",
}

export enum ProjectionLeafSection {
    ENERGY_INDUSTRIES = '1A1',
    MANUFACTURING_CONSTRUCTION = '1A2',
    CIVIL_AVIATION = '1A3a',
    ROAD_TRANSPORTATION = '1A3b',
    RAILWAYS = '1A3c',
    WATER_NAVIGATION = '1A3d',
    OTHER_TRANSPORTATION = '1A3e',
    OTHER_SECTORS = '1A4',
    NON_SPECIFIED = '1A5',
    SOLID_FUELS = '1B1',
    OIL_NATURAL_GAS = '1B2',
    OTHER_EMISSIONS = '1B3',
    TRANSPORT_CO2 = '1C1',
    INJECTION_STORAGE = '1C2',
    OTHER_CO2 = '1C3',
    
    MINERAL_INDUSTRY = '2A',
    CHEMICAL_INDUSTRY = '2B',
    METAL_INDUSTRY = '2C',
    NON_ENERGY_PRODUCTS = '2D',
    ELECTRONICS_INDUSTRY = '2E',
    SUBSTITUTES_OZONE = '2F',
    OTHER_MANUFACTURE = '2G',
    OTHER_INDUSTRIAL = '2H',
    
    ENTERIC_FERMENTATION = '3A1',
    MANURE_MANAGEMENT = '3A2',
    FOREST_LAND = '3B1',
    CROPLAND = '3B2',
    GRASSLAND = '3B3',
    WETLANDS = '3B4',
    SETTLEMENTS = '3B5',
    OTHER_LAND = '3B6',
    
    SOLID_WASTE = '4A',
    BIOLOGICAL_TREATMENT = '4B',
    INCINERATION_BURNING = '4C',
    WASTEWATER_TREATMENT = '4D',
    OTHER_WASTE = '4E',
    
    INDIRECT_N2O = '5A',
    OTHER = '5B'
}

