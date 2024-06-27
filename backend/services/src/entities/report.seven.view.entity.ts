import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportSevenViewSQL = `
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
	act."supportReceivedOrNeeded",
    act."techDevelopment",
    act."capacityBuilding",
    pr."startYear", 
    pr."endYear", 
	pve."receivedAmount",
    pve."receivedAmountDomestic",
    act."internationalSupportChannel",
    act."financialInstrument",
	act."financingStatus"
FROM 
    project pr
LEFT JOIN (
    SELECT 
        actv."parentId",
        CASE 
            WHEN MAX(CASE WHEN actv."meansOfImplementation" = 'Technology Development & Transfer' THEN 1 ELSE 0 END) = 1 THEN 'Yes'
            ELSE 'No'
        END AS "techDevelopment",
        CASE 
            WHEN MAX(CASE WHEN actv."meansOfImplementation" = 'Capacity Building' THEN 1 ELSE 0 END) = 1 THEN 'Yes'
            ELSE 'No'
        END AS "capacityBuilding",
        STRING_AGG(DISTINCT sup."internationalSupportChannel"::text, ', ') AS "internationalSupportChannel",
		CUSTOM_ARRAY_AGG(actv."internationalImplementingEntity") FILTER (WHERE actv."internationalImplementingEntity" IS NOT NULL) AS "internationalImplementingEntities",
		CUSTOM_ARRAY_AGG(actv."nationalImplementingEntity") FILTER (WHERE actv."nationalImplementingEntity" IS NOT NULL) AS "nationalImplementingEntities",
		CASE
            WHEN BOOL_OR(sup."supportReceivedActivities" = 'Received') THEN 'Received'
            WHEN BOOL_AND(sup."supportReceivedActivities" IS NULL) THEN NULL
            ELSE 'Needed'
        END AS "supportReceivedOrNeeded",
        CASE
            WHEN BOOL_AND(actv."anchoredInNationalStrategy" IS FALSE) THEN 'No'
            WHEN BOOL_OR(actv."anchoredInNationalStrategy" IS TRUE) THEN 'Yes'
            ELSE NULL
        END AS "anchoredInNationalStratergy",
        STRING_AGG(DISTINCT
			CASE
				WHEN sup."internationalFinancialInstrument" IS NOT NULL AND sup."nationalFinancialInstrument" IS NOT NULL THEN
					sup."internationalFinancialInstrument"::text || ', ' || sup."nationalFinancialInstrument"::text
				WHEN sup."internationalFinancialInstrument" IS NOT NULL THEN
					sup."internationalFinancialInstrument"::text
				WHEN sup."nationalFinancialInstrument" IS NOT NULL THEN
					sup."nationalFinancialInstrument"::text
				ELSE
					NULL
			END, ', ') AS "financialInstrument",
			CASE
				WHEN BOOL_AND(sup."financingStatus" IS NULL) THEN NULL
				WHEN BOOL_OR(sup."financingStatus" = 'Received') THEN 'Received'
				ELSE 'Committed'
			END AS "financingStatus"
    FROM 
        activity actv
    LEFT JOIN (
        SELECT 
            "activityId", 
            UNNEST(ARRAY_AGG(DISTINCT "internationalSupportChannel"::text)) AS "internationalSupportChannel",
            CASE 
                WHEN BOOL_OR(support."financeNature" = 'International' AND support.direction = 'Received') THEN 'Received'
                ELSE 'Needed'
            END AS "supportReceivedActivities",
            STRING_AGG(DISTINCT support."internationalFinancialInstrument"::text, ', ') AS "internationalFinancialInstrument",
            STRING_AGG(DISTINCT support."nationalFinancialInstrument"::text, ', ') AS "nationalFinancialInstrument",
			CASE
				WHEN BOOL_AND(support."financingStatus" IS NULL) THEN NULL
				WHEN BOOL_OR(support."financingStatus" = 'Received') THEN 'Received'
				ELSE 'Committed'
			END AS "financingStatus"
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
LEFT JOIN action acti ON acti."actionId" = subpath(pr.path, 0, 1)::text
WHERE 
    pr.validated IS TRUE
ORDER BY 
    pr."projectId";`

@ViewEntity({
	name: 'report_seven_view_entity',
	materialized: false,
	expression: reportSevenViewSQL,
	synchronize: false,
})
export class ReportSevenViewEntity {

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
	supportReceivedOrNeeded: string;

	@ViewColumn()
	techDevelopment: string;

	@ViewColumn()
	capacityBuilding: string;

	@ViewColumn()
	startYear: number;

	@ViewColumn()
	endYear: number;
	
	@ViewColumn()
	receivedAmount: number;

	@ViewColumn()
	receivedAmountDomestic: number;

	@ViewColumn()
	internationalSupportChannel: string;

	@ViewColumn()
	financialInstrument: string;

	@ViewColumn()
	financingStatus: string;

}