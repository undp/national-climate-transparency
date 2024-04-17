import { Index, ViewColumn, ViewEntity } from "typeorm"

export const actionViewSQL = `
SELECT 
    a."actionId" AS id,
    ARRAY_AGG(DISTINCT fullp.sector) FILTER (WHERE fullp.sector IS NOT NULL) AS "sectorsAffected",
    ARRAY_AGG(DISTINCT fullp.nat_impl) FILTER (WHERE fullp.nat_impl IS NOT NULL) AS "natImplementors",
    ARRAY_AGG(DISTINCT fullp.types) FILTER (WHERE fullp.types IS NOT NULL) AS types,
    MAX(fullp."achievedGHGReduction") AS "achievedGHGReduction",
    MAX(fullp."expectedGHGReduction") AS "expectedGHGReduction",
    MAX(inv."totalInvestment") AS "totalInvestment",
    MAX(finance."totalRequired") AS "financeNeeded",
    MAX(finance."totalReceived") AS "financeReceived"
FROM 
    action a
LEFT JOIN (
    SELECT 
        p."actionId",
        p."investment",
        UNNEST(p."affectedSectors") AS sector,
        UNNEST(p."natImplementor") AS nat_impl,
        UNNEST(pve.types) AS types,
        pve."achievedGHGReduction",
        pve."expectedGHGReduction"
    FROM 
        programme p
    LEFT JOIN (
		SELECT 
			id,
			types,
			SUM("achievedGHGReduction") AS "achievedGHGReduction",
			SUM("expectedGHGReduction") AS "expectedGHGReduction"
    FROM programme_view_entity
		group by id, types
		
	) pve ON p."programmeId" = pve.id
) fullp ON a."actionId" = fullp."actionId"
LEFT JOIN (
    SELECT 
        "actionId",
        SUM("investment") AS "totalInvestment"
    FROM 
        programme
    GROUP BY 
        "actionId"
) inv ON a."actionId" = inv."actionId"
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
    sectorsAffected: string[]

    @ViewColumn()
    natImplementors: string[]

    @ViewColumn()
    totalInvestment: number

    // From Project Entities

    @ViewColumn()
    types: string[]

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