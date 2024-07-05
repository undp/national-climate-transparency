import { Index, ViewColumn, ViewEntity } from "typeorm"

const expandedActivity = `
Select 
	t."activityId",
	t."title",
	t."meansOfImplementation",
	j."timeFrame",
	j."recipientEntities",
	p."subSector",
	a."type"
FROM activity t
LEFT JOIN 
	(
		SELECT
			"projectId",
			"programmeId",
			"expectedTimeFrame" as "timeFrame",
			"recipientEntities"
		FROM project
	) 
j ON j."projectId" = t."parentId"
LEFT JOIN 
	(
		SELECT
			"programmeId",
			"actionId",
			"affectedSubSector" as "subSector"
		FROM programme
	) 
p ON p."programmeId" = t."parentId" OR p."programmeId" = j."programmeId"
LEFT JOIN 
	(
		SELECT
			"actionId",
			"type"
		FROM action
	) 
a ON a."actionId" = t."parentId" OR a."actionId" = p."actionId"
`

export const reportViewSQL = `
SELECT
    s."supportId",
    e_act."activityId",
	e_act."title",
	e_act."meansOfImplementation",
	e_act."timeFrame",
	e_act."recipientEntities",
	e_act."subSector",
	e_act."type"
FROM support s
LEFT JOIN 
    (${expandedActivity})
e_act ON s."activityId" = e_act."activityId";
`

@ViewEntity({
	name: 'report_view_entity',
	materialized: false,
	expression: reportViewSQL,
	synchronize: true,
})
export class ReportViewEntity {

    @Index()
	@ViewColumn()
	supportId: string;

	@ViewColumn()
	activityId: string;

    @ViewColumn()
    title: string;

    @ViewColumn()
	meansOfImplementation: string;

    @ViewColumn()
    timeFrame: string;

    @ViewColumn()
	recipientEntities: string;

    @ViewColumn()
    subSector: string;

    @ViewColumn()
    type: string;

}