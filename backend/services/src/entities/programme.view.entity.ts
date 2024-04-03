import { Index, ViewColumn, ViewEntity } from "typeorm"

export const programmeViewSQL = `
SELECT 
			p."programmeId" AS id,
			ARRAY_AGG(DISTINCT prj.type) FILTER (WHERE prj.type IS NOT NULL) AS types,
			ARRAY_AGG(DISTINCT prj."internationalImplementingEntities") FILTER (WHERE prj."internationalImplementingEntities" IS NOT NULL) AS "internationalImplementingEntities",
			ARRAY_AGG(DISTINCT prj."recipientEntities") FILTER (WHERE prj."recipientEntities" IS NOT NULL) AS "recipientEntities",
			reductionSum."achievedGHGReduction" AS "achievedGHGReduction",
			reductionSum."expectedGHGReduction" AS "expectedGHGReduction"
	FROM 
			programme p
	LEFT JOIN (
		SELECT 
			prje."projectId" AS id,
			prje.type AS type,
			UNNEST(prje."internationalImplementingEntities") AS "internationalImplementingEntities",
			UNNEST(prje."recipientEntities") AS "recipientEntities",
			prje."programmeId"
	FROM 
			project prje
		GROUP BY 
			prje."projectId"
	) prj ON p."programmeId" = prj."programmeId"
	
	LEFT JOIN (
    SELECT 
        "programmeId",
        SUM("achievedGHGReduction") AS "achievedGHGReduction",
				SUM("expectedGHGReduction") AS "expectedGHGReduction"
    FROM 
        project
    GROUP BY 
        "programmeId"
	) reductionSum ON  p."programmeId" = reductionSum."programmeId"
	GROUP BY 
			p."programmeId", reductionsum."achievedGHGReduction", reductionsum."expectedGHGReduction";`

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