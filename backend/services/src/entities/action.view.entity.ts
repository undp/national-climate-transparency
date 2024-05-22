import { Index, ViewColumn, ViewEntity } from "typeorm"

export const actionViewSQL = `
WITH fullp AS (
	SELECT 
			prg."programmeId",
			prg."actionId",
			prg."investment",
			prg."natImplementor" AS nat_impl,
			pve.types AS types,
			COALESCE(SUM(pve."achievedGHGReduction"), 0) AS "achievedGHGReduction",
			COALESCE(SUM(pve."expectedGHGReduction"), 0) AS "expectedGHGReduction",
	CUSTOM_ARRAY_AGG(pve."ghgsAffected") FILTER (WHERE pve."ghgsAffected" IS NOT NULL) AS "ghgsAffected"
	FROM 
			programme prg
	LEFT JOIN (
			SELECT 
					id,
					types,
					SUM("achievedGHGReduction") AS "achievedGHGReduction",
					SUM("expectedGHGReduction") AS "expectedGHGReduction",
		CUSTOM_ARRAY_AGG("ghgsAffected") FILTER (WHERE "ghgsAffected" IS NOT NULL) AS "ghgsAffected"
			FROM 
					programme_view_entity
			GROUP BY 
					id, types
	) pve ON prg."programmeId" = pve.id
	GROUP BY 
			prg."programmeId", prg."actionId", prg."investment", prg."natImplementor", pve.types
),
act AS (
	SELECT 
			a."parentId" AS "actionId",
			COALESCE(SUM(a."achievedGHGReduction"), 0) AS "achievedGHGReduction",
	COALESCE(SUM(a."expectedGHGReduction"), 0) AS "expectedGHGReduction",
			CUSTOM_ARRAY_AGG(a."ghgsAffected") FILTER (WHERE a."ghgsAffected" IS NOT NULL) AS "ghgsAffected"
	FROM 
			activity a
	WHERE 
			a."parentType" = 'action'
	GROUP BY 
			a."parentId"
),
finance AS (
	SELECT 
			action,
			SUM("totalRequired") AS "totalRequired",
			SUM("totalReceived") AS "totalReceived"
	FROM 
			activity_view_entity
	GROUP BY 
			action
)
SELECT 
	a."actionId" AS id,
	CUSTOM_ARRAY_AGG(fullp.nat_impl) FILTER (WHERE fullp.nat_impl IS NOT NULL) AS "natImplementors",
	CUSTOM_ARRAY_AGG(fullp.types) FILTER (WHERE fullp.types IS NOT NULL) AS types,
	COALESCE(SUM(fullp."achievedGHGReduction"), 0) + COALESCE(act."achievedGHGReduction", 0) AS "achievedGHGReduction",
COALESCE(SUM(fullp."expectedGHGReduction"), 0) + COALESCE(act."expectedGHGReduction", 0) AS "expectedGHGReduction",
	SUM(fullp."investment") AS "totalInvestment",
	MAX(finance."totalRequired") AS "financeNeeded",
	MAX(finance."totalReceived") AS "financeReceived",
CUSTOM_ARRAY_AGG(DISTINCT COALESCE(fullp."ghgsAffected", '{}') || COALESCE(act."ghgsAffected", '{}')) FILTER (WHERE (fullp."ghgsAffected" IS NOT NULL OR act."ghgsAffected" IS NOT NULL)) AS "ghgsAffected"
FROM 
	action a
LEFT JOIN fullp ON a."actionId" = fullp."actionId"
LEFT JOIN act ON a."actionId" = act."actionId"
LEFT JOIN finance ON a."actionId" = finance.action
GROUP BY 
	a."actionId", act."achievedGHGReduction", act."expectedGHGReduction";`

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