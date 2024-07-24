export enum NatImplementor {
	AGRI_DEPT = "Agriculture Department",
	CLIMATE_DEPT = "Climate Change Department",
	CIVIL_AVIATION = "Department of Civil Aviation, Ports and Marine",
	ENERGY_DEPT = "Department of Energy",
	LAND_TRANS_DEPT = "Department of Land Transport",
	ENV_DEPT = "Environment Department",
	LAND_TRANS_AGENCY = "Land Transport Agency",
	MARITIME_SAFETY = "Maritime Safety Authority",
	PUB_TRANS_CORP = "Public Transport Corporation",
	REVEN_COMM = "Revenue Commission",
	TOUR_BOARD = "Tourism Board",
	MIN_INV_ENP_IND = "Minister for Investment, Entrepreneurship and Industry",
	MIN_FORAFF_TOURISM = "Minister of Foreign Affairs and Tourism",
	MIN_HEALTH = "Ministry of Health",
	MIN_INTAFF = "Ministry of Internal Affairs",
	MIN_TRANS = "Ministry of Transport",
	MIN_LOCGOV_COMMAFF = "Ministry for Local Government and Community Affairs",
	MIN_AGRI_CLIM_ENV = "Ministry of Agriculture, Climate Change and Environment",
	MIN_EDU = "Ministry of Education",
	MIN_EMP_SOAFF = "Ministry of Employment and Social Affairs",
	MIN_FIN_ECOPLAN_TRD = "Ministry of Finance, Economic Planning & Trade",
	MIN_FISH = "Ministry of Fisheries",
	MIN_LAND_HOUSING = "Ministry of Lands and Housing",
	MIN_YOUTH_SPO_FAM = "Ministry of Youth, Sports and Family",
	OFF_PRESIDENT = "Office of the President",
}

export enum IntImplementor {
	AFC = "AFC",
	AFD = "AFD",
	AFDB = "AFDB",
	EBRD = "EBRD",
	EIB = "EIB",
	FAO = "FAO",
	GIZ = "GIZ",
	IMF = "IMF",
	IMO = "IMO",
	IUCN = "IUCN",
	NEFCO = "NEFCO",
	UNWO = "UN Women",
	UNDP = "UNDP",
	UNEP = "UNEP",
	UNESCO = "UNESCO",
	UNFCCC = "UNFCCC",
	UNFPA = "UNFPA",
	UNICEF = "UNICEF",
	UNIDO = "UNIDO",
	USAID = "USAID",
	WFP = "WFP",
	WMO = "WMO",
	WB = "World Bank",
}

export enum Recipient {
	MIN_INV_ENP_IND = "Minister for Investment, Entrepreneurship and Industry",
	MIN_FORAFF_TOURISM = "Minister of Foreign Affairs and Tourism",
	MIN_HEALTH = "Ministry of Health",
	MIN_INTAFF = "Ministry of Internal Affairs",
	MIN_TRANS = "Ministry of Transport",
	MIN_LOCGOV_COMMAFF = "Ministry for Local Government and Community Affairs",
	MIN_AGRI_CLIM_ENV = "Ministry of Agriculture, Climate Change and Environment",
	MIN_EDU = "Ministry of Education",
	MIN_EMP_SOAFF = "Ministry of Employment and Social Affairs",
	MIN_FIN_ECOPLAN_TRD = "Ministry of Finance, Economic Planning & Trade",
	MIN_FISH = "Ministry of Fisheries",
	MIN_LAND_HOUSING = "Ministry of Lands and Housing",
	MIN_YOUTH_SPO_FAM = "Ministry of Youth, Sports and Family",
	OFF_PRESIDENT = "Office of the President",
}

export enum EntityType {
	ACTION = "action",
	PROGRAMME = "programme",
	PROJECT = "project",
	ACTIVITY = "activity",
	SUPPORT = "support",
}

export enum LogEventType {
	ACTION_CREATED = 0,
	KPI_ADDED = 1,
	KPI_UPDATED = 2,
	PROGRAMME_LINKED = 3,
	ACTION_UPDATED = 4,
	PROGRAMME_CREATED = 5,
	LINKED_TO_ACTION = 6,
	UNLINKED_FROM_ACTION = 7,
	PROJECT_CREATED = 8,
	PROJECT_LINKED = 9,
	LINKED_TO_PROGRAMME = 10,
	UNLINKED_FROM_PROGRAMME = 11,
	ACTIVITY_CREATED = 12,
	ACTIVITY_LINKED = 13,
	LINKED_TO_PROJECT = 14,
	UNLINKED_FROM_PROJECT = 15,
	PROGRAMME_UPDATED = 16,
	PROJECT_UPDATED = 17,
	ACTION_VERIFIED = 18,
	PROJECT_VERIFIED = 19,
	ACTIVITY_UPDATED = 20,
	ACTIVITY_VERIFIED = 21,
	SUPPORT_CREATED = 22,
	SUPPORT_LINKED = 23,
	LINKED_TO_ACTIVITY = 24,
	SUPPORT_VERIFIED = 25,
	SUPPORT_UPDATED = 26,
	UNLINKED_FROM_ACTIVITY = 27,
	PROGRAMME_VERIFIED = 28,
	MTG_UPDATED = 29,
	ACTION_UNVERIFIED = 30,
	PROGRAMME_UNVERIFIED = 31,
	PROJECT_UNVERIFIED = 32,
	ACTIVITY_UNVERIFIED = 33,
	SUPPORT_UNVERIFIED = 34,
	// unverified due to an update in one of the attached entities
	ACTION_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE = 35,
	PROGRAMME_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE = 36,
	PROJECT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE = 37,
	ACTIVITY_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE = 38,
	SUPPORT_UNVERIFIED_DUE_LINKED_ENTITY_UPDATE = 39,
	// unverified due to the entity being updated
	ACTION_UNVERIFIED_DUE_UPDATE = 40,
	PROGRAMME_UNVERIFIED_DUE_UPDATE = 41,
	PROJECT_UNVERIFIED_DUE_UPDATE = 42,
	ACTIVITY_UNVERIFIED_DUE_UPDATE = 43,
	SUPPORT_UNVERIFIED_DUE_UPDATE = 44,
	// unverified due to new attachment or detachment in the tree
	ACTION_UNVERIFIED_DUE_ATTACHMENT_CHANGE = 45,
	PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_CHANGE = 46,
	PROJECT_UNVERIFIED_DUE_ATTACHMENT_CHANGE = 47,
	ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_CHANGE = 48,
	SUPPORT_UNVERIFIED_DUE_ATTACHMENT_CHANGE = 49,

	// unverified due to an attachment being deleted from the tree
	ACTION_UNVERIFIED_DUE_ATTACHMENT_DELETE = 50,
	PROGRAMME_UNVERIFIED_DUE_ATTACHMENT_DELETE = 51,
	PROJECT_UNVERIFIED_DUE_ATTACHMENT_DELETE = 52,
	ACTIVITY_UNVERIFIED_DUE_ATTACHMENT_DELETE = 53,

	//activity unverified due to mitigation timeline update
	ACTIVITY_UNVERIFIED_DUE_MITIGATION_TIMELINE_UPDATE = 54,
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

export enum SubSector {
	GRID_GENERAT = "Grid-Connected Generation (electricity)",
	OFF_GRID_GENERAT = "Off-Grid / Rural Generation (electricity)",
	TRANS_DISTR = "Transmission & Distribution (electricity)",
	FUEL = "Fuels",
	GOV = "Government",
	INDUSTRY = "Industry",
	APPLIANCES = "Appliances",
	WATER = "Water",
	CITIES = "Cities",
	BUILDINGS = "Buildings",
	LAND_TRANSPORT = "Land (transport)",
	MARITIME_TRANSPORT = "Maritime (transport)",
	AVIATION_TRANSPORT = "Aviation (transport)",
	WASTE_WATER = "Wastewater",
	WASTE_SOLID = "Solid Waste",
	FORESTRY = "Forestry",
	AGR_FORESTRY = "Agroforestry",
	AGRICULTURE = "Agriculture",
	LAND_USE = "Land Use",
	COASTAL = "Coastal",
	FISHING = "Fishing",
	BIO_DIVERSITY = "Biodiversity",
	ECO_SYS = "Ecosystems",
	NATURE_BASED = "Nature Based Solutions",
	TOURISM = "Tourism",
	COMMERCIAL = "Commercial",
	HOUSE_HOLDS = "Households",
	MULTI_SUB_SEC = "Multi-Subsector",
	NA = "Not Applicable",
}

export enum ExportFileType {
	XLSX = "xlsx",
	CSV = "csv"
}

export enum KPIAction {
	NONE = 'None',
	CREATED = 'Created',
	UPDATED = 'Updated',
}

export enum Reports {
	FIVE = '5',
	SIX = '6',
	SEVEN = '7',
	EIGHT = '8',
	NINE = '9',
	TEN = '10',
	ELEVEN = '11',
	TWELVE = '12',
	THIRTEEN = '13',
}

export enum Method {
	CREATE = 'create',
	UPDATE = 'update',
	VIEW = 'view',
}

export enum SystemResourceCategory {
	GHG = 'GHG',
	FAQ = 'FAQ'
}

export enum SystemResourceType {
	DOCUMENT = 'DOCUMENT'
}