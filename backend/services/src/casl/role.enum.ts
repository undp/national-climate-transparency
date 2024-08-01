export enum Role {
	Observer = 'Observer',
	GovernmentUser = 'GovernmentUser',
	Admin = 'Admin',
    Root = 'Root',
}

export enum SubRole {
	GovernmentDepartment = 'GovernmentDepartment',
	Consultant = 'Consultant',
	SEO = 'SEO',
	TechnicalReviewer = 'TechnicalReviewer',
	DevelopmentPartner = 'DevelopmentPartner'
}

export const roleSubRoleMap = {
	'GovernmentUser': ['GovernmentDepartment', 'Consultant', 'SEO'],
	'Observer': ['TechnicalReviewer', 'DevelopmentPartner']
}