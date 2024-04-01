import { Index, ViewColumn, ViewEntity } from "typeorm"

export const programmeViewSQL =  `
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
    intImplementors: string[]

    @ViewColumn()
    recipients: string[]

    @ViewColumn()
    achievedReduct: number

    @ViewColumn()
    expectedReduct: number

    // No Clue of Location

    // @ViewColumn()
    // ghgsAffected: string[]
}