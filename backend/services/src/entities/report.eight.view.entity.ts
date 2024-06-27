import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportEightViewSQL = `
SELECT 
    pr."projectId",
    pr.title, 
    pr.description, 
    pr.sector,
    pro."affectedSubSector" as "subSectors",
    actn.type,
		act."technologyType",
		act."supportReceivedOrNeeded",
    pr."startYear", 
    pr."endYear" 
FROM 
    project pr
LEFT JOIN (
    SELECT 
        actv."parentId",
				ARRAY_AGG(DISTINCT actv."technologyType"::text) FILTER (WHERE actv."technologyType" IS NOT NULL) AS "technologyType",
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
            UNNEST(ARRAY_AGG(DISTINCT "internationalSupportChannel"::text)) AS "internationalSupportChannel",
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
LEFT JOIN project_view_entity pve ON pve.id = pr."projectId"
LEFT JOIN programme pro ON pro."programmeId" = pr."programmeId" AND pro.validated IS TRUE
LEFT JOIN "action" actn ON pro."actionId" = actn."actionId" AND actn.validated IS TRUE
WHERE 
    pr.validated IS TRUE
ORDER BY 
    pr."projectId";`

@ViewEntity({
	name: 'report_eight_view_entity',
	materialized: false,
	expression: reportEightViewSQL,
	synchronize: false,
})
export class ReportEightViewEntity {

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
	technologyType: string;

	@ViewColumn()
	supportReceivedOrNeeded: string;

	@ViewColumn()
	startYear: number;

	@ViewColumn()
	endYear: number;

}