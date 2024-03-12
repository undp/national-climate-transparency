export enum NatImplementor {}
export enum IntImplementor {}

export enum EntityType {
  ACTION = "action",
  PROGRAM = "program",
  PROJECT = "project",
  ACTIVITY = "activity",
}

export enum GHGS {
  CO = "CO2",
  CH = "CH4",
  NO = "N2O",
  HFC = "HFCs",
  NF = "NF3",
  PFC = "PFCs",
  SF = "SF6",
}

export enum OrgType {
  GOVERNMENT = "Government",
  DEPARTMENT = "Department",
  API = "API",
}

export enum Sector {
  Energy = "Energy",
  Transport = "Transport",
  Industry = "Industry (IPPU)",
  Agriculture = "Agriculture",
  Forestry = "Forestry",
  WaterAndSanitation = "Water and Sanitation",
  LandUse = "Land Use",
  CrossCutting = "Cross-cutting",
  Other = "Other",
}

export enum SubSector {
  GRID = "Grid-Connected Generation (electricity)",
  OFFGRID = "Off-Grid / Rural Generation (electricity)",
  TND = "Transmission & Distribution (electricity)",
  FUEL = "Fuels",
  GOV = "Government",
  IND = "Industry",
  APPL = "Appliances",
  WATER = "Water",
  CITY = "Cities",
  BUILDING = "Buildings",
  LAND = "Land (transport)",
  MARITIME = "Maritime (transport)",
  AVIATION = "Aviation (transport)",
  WASTEW = "Wastewater",
  WASTES = "Solid Waste",
  FOREST = "Forestry",
  AGFOREST = "Agroforestry",
  AGRC = "Agriculture",
  LANDUSE = "Land Use",
  COASTAL = "Coastal",
  FISHING = "Fishing",
  BIOD = "Biodiversity",
  ECOS = "Ecosystems",
  NBS = "Nature Based Solutions",
  TOURISM = "Tourism",
  COMM = "Commercial",
  HOUSE = "Households",
  MULTISUB = "Multi-Subsector",
  NA = "Not Applicable",
}

export enum Role {
  SADMIN = "Super Admin",
  ADMIN = "Admin",
  OBSERVER = "Observer",
  USER = "User",
}
