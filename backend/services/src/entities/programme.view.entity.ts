import { Index, ViewColumn, ViewEntity } from "typeorm"

export const programmeViewSQL = `
SELECT 
	p."programmeId" AS id,
	CAST(ARRAY_AGG(DISTINCT fullprj.type) FILTER (WHERE fullprj.type IS NOT NULL) AS character varying[]) AS types,
	CUSTOM_ARRAY_AGG(fullprj."internationalImplementingEntities") FILTER (WHERE fullprj."internationalImplementingEntities" IS NOT NULL) AS "internationalImplementingEntities",
	CUSTOM_ARRAY_AGG(fullprj."recipientEntities") FILTER (WHERE fullprj."recipientEntities" IS NOT NULL) AS "recipientEntities",
	SUM(fullprj."achievedGHGReduction") AS "achievedGHGReduction",
	SUM(fullprj."expectedGHGReduction") AS "expectedGHGReduction"
FROM 
	programme p
LEFT JOIN (
	SELECT 
		prj."projectId" AS id,
		prj.type AS type,
		prj."programmeId",
		prj."internationalImplementingEntities",
		prj."recipientEntities",
		p_v_e."achievedGHGReduction" AS "achievedGHGReduction",
		p_v_e."expectedGHGReduction" AS "expectedGHGReduction"
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
		prj."projectId", p_v_e."achievedGHGReduction", p_v_e."expectedGHGReduction"
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