import { Index, ViewColumn, ViewEntity } from "typeorm"

export const actionViewSQL = `
SELECT 
    a."actionId" AS id,
	CUSTOM_ARRAY_AGG(fullp.sector) FILTER (WHERE fullp.sector IS NOT NULL) AS "sectorsAffected",
    CUSTOM_ARRAY_AGG(fullp.nat_impl) FILTER (WHERE fullp.nat_impl IS NOT NULL) AS "natImplementors",
	CUSTOM_ARRAY_AGG(fullp.types) FILTER (WHERE fullp.types IS NOT NULL) AS types,
    SUM(fullp."achievedGHGReduction") AS "achievedGHGReduction",
    SUM(fullp."expectedGHGReduction") AS "expectedGHGReduction",
    SUM(fullp."investment") AS "totalInvestment",
    MAX(finance."totalRequired") AS "financeNeeded",
    MAX(finance."totalReceived") AS "financeReceived"
FROM 
    action a
LEFT JOIN (
	SELECT 
		prg."programmeId",
		prg."actionId",
		prg."investment",
		prg."affectedSectors" AS sector,
		prg."natImplementor" AS nat_impl,
		pve.types AS types,
		pve."achievedGHGReduction",
		pve."expectedGHGReduction"
	FROM 
		programme prg
	LEFT JOIN (
		SELECT 
			id,
			types,
			SUM("achievedGHGReduction") AS "achievedGHGReduction",
			SUM("expectedGHGReduction") AS "expectedGHGReduction"
		FROM programme_view_entity
		GROUP BY 
			id, types
	) pve ON prg."programmeId" = pve.id
) fullp ON a."actionId" = fullp."actionId"
LEFT JOIN (
    SELECT 
        action,
        SUM("totalRequired") AS "totalRequired",
        SUM("totalReceived") AS "totalReceived"
    FROM 
        activity_view_entity
    GROUP BY 
        action
) finance ON a."actionId" = finance.action
GROUP BY 
    a."actionId";`

@ViewEntity({
    name: 'action_view_entity',
    materialized: true,
    expression: actionViewSQL,
    synchronize: false
})
export class ActionViewEntity {
    @Index()
    @ViewColumn()
    id: string

    @ViewColumn()
    sectorsAffected: string[];

    @ViewColumn()
    natImplementors: string[];

    @ViewColumn()
    totalInvestment: number

    // From Project Entities

    @ViewColumn()
    types: string[];

    @ViewColumn()
    achievedGHGReduction: number

    @ViewColumn()
    expectedGHGReduction: number

    // From Activity + Support View

    @ViewColumn()
    financeNeeded: number

    @ViewColumn()
    financeReceived: number

    // No Clue to location

    // @ViewColumn()
    // ghgsAffected: string[]
}