import { Index, ViewColumn, ViewEntity } from "typeorm"

export const actionViewSQL = `
SELECT 
    a."actionId" AS id,
    ARRAY_AGG(DISTINCT fullp.sector) FILTER (WHERE fullp.sector IS NOT NULL) AS "sectorsAffected",
    ARRAY_AGG(DISTINCT fullp.nat_impl) FILTER (WHERE fullp.nat_impl IS NOT NULL) AS "natImplementors",
    ARRAY_AGG(DISTINCT fullp.types) FILTER (WHERE fullp.types IS NOT NULL) AS types,
    SUM(fullp."achievedReduct") AS "achievedReduct",
    SUM(fullp."expectedReduct") AS "expectedReduct",
    inv."totalInvestment" AS "totalInvestment"
FROM 
    action a
LEFT JOIN (
    SELECT 
        p."actionId",
        p."investment",
        UNNEST(p."affectedSectors") AS sector,
        UNNEST(p."natImplementor") AS nat_impl,
        UNNEST(pve.types) AS types,
        pve."achievedReduct",
        pve."expectedReduct"
    FROM 
        programme p
    LEFT JOIN 
        programme_view_entity pve ON p."programmeId" = pve.id
) fullp ON a."actionId" = fullp."actionId"
LEFT JOIN (
    SELECT 
        "actionId",
        SUM("investment") AS "totalInvestment"
    FROM 
        programme
    GROUP BY 
        "actionId"
) inv ON a."actionId" = inv."actionId"
GROUP BY 
    a."actionId", inv."totalInvestment";`

@ViewEntity({
    name: 'action_view_entity',
    materialized: true,
    expression: actionViewSQL,
    synchronize: false
})
export class ActionViewEntity {
    @Index()
    @ViewColumn()
    id: string

    @ViewColumn()
    sectorsAffected: string[]

    @ViewColumn()
    natImplementors: string[]

    @ViewColumn()
    totalInvestment: number

    // From Project Entities

    @ViewColumn()
    types: string[]

    @ViewColumn()
    achievedReduct: number

    @ViewColumn()
    expectedReduct: number

    // No Clue to location

    // @ViewColumn()
    // ghgsAffected: string[]
}