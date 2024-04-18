import { Index, ViewColumn, ViewEntity } from "typeorm"

export const programmeViewSQL = `
SELECT 
		p."programmeId" AS id,
		ARRAY_AGG(DISTINCT fullprj.type) FILTER (WHERE fullprj.type IS NOT NULL) AS types,
		ARRAY_AGG(DISTINCT fullprj."internationalImplementingEntities") FILTER (WHERE fullprj."internationalImplementingEntities" IS NOT NULL) AS "internationalImplementingEntities",
		ARRAY_AGG(DISTINCT fullprj."recipientEntities") FILTER (WHERE fullprj."recipientEntities" IS NOT NULL) AS "recipientEntities",
		SUM(fullprj."achievedGHGReduction") AS "achievedGHGReduction",
		SUM(fullprj."expectedGHGReduction") AS "expectedGHGReduction"
FROM 
		programme p
LEFT JOIN (
	SELECT 
		prj."projectId" AS id,
		prj.type AS type,
		prj."programmeId",
		UNNEST(prj."internationalImplementingEntities") AS "internationalImplementingEntities",
		UNNEST(prj."recipientEntities") AS "recipientEntities",
		MAX(p_v_e."achievedGHGReduction") AS "achievedGHGReduction",
		MAX(p_v_e."expectedGHGReduction") AS "expectedGHGReduction"
	FROM 
		project prj
	LEFT JOIN (
		SELECT 
			id,
			"achievedGHGReduction",
			"expectedGHGReduction"
		FROM 
			project_view_entity
		) p_v_e ON prj."projectId" = p_v_e.id
	GROUP BY 
		prj."projectId"
	) fullprj ON p."programmeId" = fullprj."programmeId"
GROUP BY 
	p."programmeId";`

@ViewEntity({
	name: 'programme_view_entity',
	materialized: true,
	expression: programmeViewSQL,
	synchronize: false,
})
export class ProgrammeViewEntity {
	@Index()
	@ViewColumn()
	id: number

	@ViewColumn()
	types: string[]

	@ViewColumn()
	internationalImplementingEntities: string[]

	@ViewColumn()
	recipientEntities: string[]

	@ViewColumn()
	achievedGHGReduction: number

	@ViewColumn()
	expectedGHGReduction: number

	// No Clue of Location

	// @ViewColumn()
	// ghgsAffected: string[]
}