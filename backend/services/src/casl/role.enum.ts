export enum Role {
    Root = 'Root',
    Admin = 'Admin',
    GovernmentUser = 'GovernmentUser',
    Observer = 'Observer',
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