import { Index, ViewColumn, ViewEntity } from "typeorm"

@ViewEntity({
    materialized: true,
    expression: `
    SELECT 
        a."actionId" AS id,
        ARRAY_AGG(DISTINCT p.sector) AS sectors,
        SUM(p.investment) AS total_investment,
        ARRAY_AGG(DISTINCT p.nat_impl) AS nat_implementors
    FROM 
        action a
    LEFT JOIN (
        SELECT 
            "actionId",
            "investment",
            UNNEST("affectedSectors") AS sector,
            UNNEST("natImplementor") AS nat_impl
        FROM 
            programme
    ) p ON a."actionId" = p."actionId"
    GROUP BY 
        a."actionId";`,
})

export class ActivityViewEntity {
    @Index()
    @ViewColumn()
    id: number

    @ViewColumn()
    actionDesc: string

    @ViewColumn()
    recipients: string[]

    @ViewColumn()
    total_investmemt: number

    @ViewColumn()
    sectorsAffected: string[]

    @ViewColumn()
    subSectorsAffected: string[]

    @ViewColumn()
    startYear: string

    @ViewColumn()
    endYear: string

    @ViewColumn()
    timeFrame: string
}