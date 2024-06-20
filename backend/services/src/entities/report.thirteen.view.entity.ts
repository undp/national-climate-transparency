import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportThirteenViewSQL = `
SELECT 
	pr."projectId",
    pr.title, 
    pr.description, 
	pr."recipientEntities",
    pr."projectStatus", 
    pr."startYear", 
    pr."endYear", 
    act."transparency",
	act."internationalSupportChannel",
	act."supportReceivedOrNeeded",
	pve."receivedAmount",
	pve."receivedAmountDomestic"
FROM 
    project pr
LEFT JOIN (
	SELECT 
		actv."parentId",
		CASE 
			WHEN MAX(CASE WHEN actv."meansOfImplementation" = 'Transparency' THEN 1 ELSE 0 END) = 1 THEN 'Yes'
			ELSE 'No'
		END AS "transparency",
		STRING_AGG(DISTINCT sup."internationalSupportChannel"::text, ', ') AS "internationalSupportChannel",
		CASE
			WHEN BOOL_OR(sup."supportReceivedActivities" = 'Received') THEN 'Received'
			WHEN BOOL_OR(sup."supportReceivedActivities" IS NULL) THEN NULL
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
	ORDER BY 
		actv."parentId" ASC
) act ON pr."projectId" = act."parentId"
LEFT JOIN project_view_entity pve ON pve.id = pr."projectId"
WHERE pr.validated IS TRUE
ORDER BY 
    pr."projectId";`

@ViewEntity({
	name: 'report_thirteen_view_entity',
	materialized: false,
	expression: reportThirteenViewSQL,
	synchronize: false,
})
export class ReportThirteenViewEntity {

	@Index()
	@ViewColumn()
	projectId: string;

	@ViewColumn()
	title: string;

	@ViewColumn()
	description: string;

	@ViewColumn()
	recipientEntities: string;

	@ViewColumn()
	projectStatus: string;

	@ViewColumn()
	startYear: number;

	@ViewColumn()
	endYear: number;

	@ViewColumn()
	transparency: string;

	@ViewColumn()
	internationalSupportChannel: string;

	@ViewColumn()
	supportReceivedOrNeeded: string;

	@ViewColumn()
	receivedAmount: number;

	@ViewColumn()
	receivedAmountDomestic: number;

}