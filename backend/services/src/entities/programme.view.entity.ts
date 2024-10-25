import { Index, ViewColumn, ViewEntity } from "typeorm";

export const programmeViewSQL = `
WITH fullprj AS (
	SELECT 
			prj."projectId" AS id,
			prj."programmeId",
			prj."internationalImplementingEntities",
			p_v_e."recipientEntities",
			COALESCE(SUM(p_v_e."achievedGHGReduction"), 0) AS "achievedGHGReduction",
			COALESCE(SUM(p_v_e."expectedGHGReduction"), 0) AS "expectedGHGReduction",
			COALESCE(SUM(p_v_e."estimatedAmount"), 0) AS "estimatedAmount",
    	COALESCE(SUM(p_v_e."receivedAmount"), 0) AS "receivedAmount",
			CUSTOM_ARRAY_AGG(p_v_e."ghgsAffected") FILTER (WHERE p_v_e."ghgsAffected" IS NOT NULL) AS "ghgsAffected"
	FROM 
			project prj
	LEFT JOIN (
			SELECT 
					id,
					"achievedGHGReduction",
					"expectedGHGReduction",
					"ghgsAffected",
					"recipientEntities",
					"estimatedAmount",
					"receivedAmount"
			FROM 
					project_view_entity
	) p_v_e ON prj."projectId" = p_v_e.id
	GROUP BY 
			prj."projectId", prj."programmeId", prj."internationalImplementingEntities", p_v_e."recipientEntities"
),
act AS (
	SELECT 
			a."parentId" AS "programmeId",
			COALESCE(SUM(a."achievedGHGReduction"), 0) AS "achievedGHGReduction",
			COALESCE(SUM(a."expectedGHGReduction"), 0) AS "expectedGHGReduction",
			COALESCE(SUM(sup."requiredAmount"), 0) AS "requiredAmount",
			COALESCE(SUM(sup."receivedAmount"), 0) AS "receivedAmount",
			ARRAY_AGG(a."ghgsAffected") FILTER (WHERE a."ghgsAffected" IS NOT NULL)::character varying[] AS "ghgsAffected",
	    CUSTOM_ARRAY_AGG(a."recipientEntities") FILTER (WHERE a."recipientEntities" IS NOT NULL)::character varying[] AS "recipientEntities"
	FROM 
			activity a
	LEFT JOIN (
        SELECT 
            "activityId",
            SUM("requiredAmount") AS "requiredAmount",
            SUM("receivedAmount") AS "receivedAmount"
        FROM 
            support
        GROUP BY 
            "activityId"
        ) sup ON a."activityId" = sup."activityId"
	WHERE 
			a."parentType" = 'programme'
	GROUP BY 
			a."parentId"
)
SELECT 
	p."programmeId" AS id,
	CUSTOM_ARRAY_AGG(fullprj."internationalImplementingEntities") FILTER (WHERE fullprj."internationalImplementingEntities" IS NOT NULL) AS "internationalImplementingEntities",
	CUSTOM_ARRAY_AGG(DISTINCT COALESCE(fullprj."recipientEntities", '{}') || COALESCE(act."recipientEntities", '{}')) FILTER (WHERE (fullprj."recipientEntities" IS NOT NULL OR act."recipientEntities" IS NOT NULL)) AS "recipientEntities",
	COALESCE(SUM(fullprj."achievedGHGReduction"), 0) + COALESCE(act."achievedGHGReduction", 0) AS "achievedGHGReduction",
	COALESCE(SUM(fullprj."expectedGHGReduction"), 0) + COALESCE(act."expectedGHGReduction", 0) AS "expectedGHGReduction",
	CUSTOM_ARRAY_AGG(DISTINCT COALESCE(fullprj."ghgsAffected", '{}') || COALESCE(act."ghgsAffected", '{}')) FILTER (WHERE (fullprj."ghgsAffected" IS NOT NULL OR act."ghgsAffected" IS NOT NULL)) AS "ghgsAffected",
	MAX(COALESCE(fullprj."estimatedAmount", 0) + COALESCE(act."requiredAmount", 0)) as "estimatedAmount",
	MAX(COALESCE(fullprj."receivedAmount", 0) + COALESCE(act."receivedAmount", 0)) as "receivedAmount"
FROM 
	programme p
LEFT JOIN fullprj ON p."programmeId" = fullprj."programmeId"
LEFT JOIN act ON p."programmeId" = act."programmeId"
GROUP BY 
	p."programmeId", act."achievedGHGReduction", act."expectedGHGReduction";`;

@ViewEntity({
  name: "programme_view_entity",
  materialized: true,
  expression: programmeViewSQL,
  synchronize: false,
})
@Index("idx_programme_view_entity_id")
export class ProgrammeViewEntity {
  @ViewColumn()
  id: string;

  @ViewColumn()
  internationalImplementingEntities: string[];

  @ViewColumn()
  recipientEntities: string[];

  @ViewColumn()
  achievedGHGReduction: number;

  @ViewColumn()
  expectedGHGReduction: number;

  @ViewColumn()
  ghgsAffected: string[];

  @ViewColumn()
  estimatedAmount: number

  @ViewColumn()
  receivedAmount: number
}
