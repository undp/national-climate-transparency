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

export class ProjectViewEntity {
    @Index()
    @ViewColumn()
    id: number

    // @ViewColumn()
    // actionTitle: string

    // @ViewColumn()
    // programmeTitle: string

    @ViewColumn()
    natAnchors: string[]

    @ViewColumn()
    instrTypes: string[]

    @ViewColumn()
    sectorsAffected: string[]

    @ViewColumn()
    subSectorsAffected: string[]

    @ViewColumn()
    natImplementors: string[]

    @ViewColumn()
    implMeans: string[]

    @ViewColumn()
    technologyTypes: string[]

    @ViewColumn()
    estimatedAmount: number

    @ViewColumn()
    recievedAmount: number
}