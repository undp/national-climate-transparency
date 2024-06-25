import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportElevenViewSQL = `
SELECT 
    pr."projectId",
    pr.title, 
    pr.description, 
    pr.sector,
    pro."affectedSubSector" as "subSectors",
    acti.type,
	pr."recipientEntities",
	act."nationalImplementingEntities",
    act."internationalImplementingEntities",
    pr."projectStatus", 
	act."supportReceivedOrNeeded",
    pr."startYear", 
    pr."endYear"
FROM 
    project pr
LEFT JOIN (
    SELECT 
        actv."parentId",
		CUSTOM_ARRAY_AGG(actv."internationalImplementingEntity") FILTER (WHERE actv."internationalImplementingEntity" IS NOT NULL) AS "internationalImplementingEntities",
		CUSTOM_ARRAY_AGG(actv."nationalImplementingEntity") FILTER (WHERE actv."nationalImplementingEntity" IS NOT NULL) AS "nationalImplementingEntities",
		CASE
            WHEN BOOL_OR(sup."supportReceivedActivities" = 'Received') THEN 'Received'
            WHEN BOOL_AND(sup."supportReceivedActivities" IS NULL) THEN NULL
            ELSE 'Needed'
        END AS "supportReceivedOrNeeded"
    FROM 
        activity actv
    LEFT JOIN (
        SELECT 
            "activityId", 
            CASE 
                WHEN BOOL_OR(support."financeNature" = 'International' AND support.direction = 'Received') THEN 'Received'
                ELSE 'Needed'
            END AS "supportReceivedActivities"
        FROM 
            support
        WHERE support.validated IS TRUE
        GROUP BY 
            "activityId"
    ) sup ON sup."activityId" = actv."activityId"
    WHERE 
        actv."parentType" = 'project' AND actv.validated IS TRUE
    GROUP BY 
        actv."parentId"
) act ON pr."projectId" = act."parentId"
LEFT JOIN programme pro ON pro."programmeId" = pr."programmeId" AND pro.validated IS TRUE
LEFT JOIN action acti ON acti."actionId" = subpath(pr.path, 0, 1)::text
WHERE 
    pr.validated IS TRUE
ORDER BY 
    pr."projectId";`

@ViewEntity({
	name: 'report_eleven_view_entity',
	materialized: false,
	expression: reportElevenViewSQL,
	synchronize: false,
})
export class ReportElevenViewEntity {

	@Index()
	@ViewColumn()
	projectId: string;

	@ViewColumn()
	title: string;

	@ViewColumn()
	description: string;

	@ViewColumn()
	sector: string;

	@ViewColumn()
	subSectors: string;

	@ViewColumn()
	type: string;	
	
	@ViewColumn()
	recipientEntities: string;

	@ViewColumn()
	nationalImplementingEntities: string;
	
	@ViewColumn()
	internationalImplementingEntities: string;

    @ViewColumn()
	projectStatus: number;

	@ViewColumn()
	supportReceivedOrNeeded: string;

	@ViewColumn()
	startYear: number;

	@ViewColumn()
	endYear: number;

}