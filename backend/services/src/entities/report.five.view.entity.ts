import { Index, ViewColumn, ViewEntity } from "typeorm"

export const reportFiveViewSQLOld = `
SELECT 'action' AS source, * FROM (
	SELECT "actionId", NULL as "programmeId", NULL as "projectId", title as "titleOfAction", NULL as "titleOfProgramme", NULL as "titleOfProject",
description, objective, "instrumentType", status::text, sector::text, ave."ghgsAffected", "startYear" , ARRAY[]::text[] as "implementingEntities", 
ave."achievedGHGReduction", ave."expectedGHGReduction"
	FROM action act join action_view_entity ave on ave.id = act."actionId"
	WHERE validated = true
) act

UNION ALL

SELECT 'programme' AS source, * FROM (
	SELECT "actionId", "programmeId", NULL as "projectId", NULL as "titleOfAction", title as "titleOfProgramme", NULL as "titleOfProject",
description, objective, ARRAY[]::text[] as "instrumentType", "programmeStatus"::text, sector::text, pve."ghgsAffected", "startYear" , "natImplementor" as "implementingEntities", 
pve."achievedGHGReduction", pve."expectedGHGReduction"
	FROM programme prog join programme_view_entity pve on pve.id = prog."programmeId"
	WHERE validated = true
) prog

UNION ALL

SELECT 'project' AS source, * FROM (
	SELECT pro."actionId", prj."programmeId", "projectId", NULL as "titleOfAction", NULL as "titleOfProgramme", prj.title as "titleOfProject",
prj.description, objective, ARRAY[]::text[] as "instrumentType", "projectStatus"::text, prj.sector::text, prve."ghgsAffected", 
prj."startYear" , "internationalImplementingEntities" as "implementingEntities", 
prve."achievedGHGReduction", prve."expectedGHGReduction"
	FROM project prj 
left join programme pro on pro."programmeId" = prj."programmeId"
join project_view_entity prve on prve.id = prj."projectId"
	WHERE prj.validated = true
) proj
;`

export const reportFiveViewSQL = `
SELECT 'action' AS source, * FROM (
	SELECT "actionId", title as "titleOfAction",
description, objective, "instrumentType", status::text, sector::text, ave."ghgsAffected", "startYear" , ave."natImplementors" as "implementingEntities", 
ave."achievedGHGReduction", ave."expectedGHGReduction"
	FROM action act join action_view_entity ave on ave.id = act."actionId"
	WHERE validated = true
) act;`

@ViewEntity({
	name: 'report_five_view_entity',
	materialized: true,
	expression: reportFiveViewSQL,
	synchronize: false,
})
@Index("idx_report_five_view_entity_id")
export class ReportFiveViewEntity {

	@ViewColumn()
	source: string;

	@ViewColumn()
	actionId: string;

	// @ViewColumn()
	// programmeId: string;

	// @ViewColumn()
	// projectId: string;

	@ViewColumn()
	titleOfAction: string;

	// @ViewColumn()
	// titleOfProgramme: string;

	// @ViewColumn()
	// titleOfProject: string;

	@ViewColumn()
	description: string;

	@ViewColumn()
	objective: string;

	@ViewColumn()
	instrumentType: string;

	@ViewColumn()
	status: string;

	@ViewColumn()
	sector: string;

	@ViewColumn()
	ghgsAffected: string;

	@ViewColumn()
	startYear: string;

	@ViewColumn()
	implementingEntities: string;

	@ViewColumn()
	achievedGHGReduction: string;

	@ViewColumn()
	expectedGHGReduction: string;

}