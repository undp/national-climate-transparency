import { Index, ViewColumn, ViewEntity } from "typeorm"

@ViewEntity({
    materialized: true,
    expression: `
    SELECT 
        p."programmeId" AS id,
        ARRAY_AGG(DISTINCT prj.type) AS types,
        ARRAY_AGG(DISTINCT prj."intImplementor") AS "intImplementors",
        ARRAY_AGG(DISTINCT prj.recipient) AS recipients,
        SUM(prj."achievedReduct") AS "achievedReduct",
        SUM(prj."expectedReduct") AS "expectedReduct"
    FROM 
        programme p
    LEFT JOIN 
        project prj ON p."programmeId" = prj."programmeId"
    GROUP BY 
        p."programmeId";`,
})

export class ProgrammeViewEntity {
    @Index()
    @ViewColumn()
    id: number

    @ViewColumn()
    types: string[]

    @ViewColumn()
    intImplementors: string[]

    @ViewColumn()
    recipients: string[]

    @ViewColumn()
    achievedReduct: number

    @ViewColumn()
    expectedReduct: number

    // From Action

    // @ViewColumn()
    // instrTypes: string[]

    // No Clue of Location

    // @ViewColumn()
    // ghgsAffected: string[]
}