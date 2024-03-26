import { Index, ViewColumn, ViewEntity } from "typeorm"

@ViewEntity({
    materialized: true,
    expression: `
    SELECT 
        a."actionId" AS id,
        ARRAY_AGG(DISTINCT fullp.sector) AS sectors,
        ARRAY_AGG(DISTINCT fullp.nat_impl) AS nat_implementors,
		ARRAY_AGG(DISTINCT fullp.types) AS types,
		SUM(fullp.investment) AS total_investment,
		SUM(fullp."achievedReduct") AS "achievedReduct",
		SUM(fullp."expectedReduct") AS "expectedReduct"
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
    GROUP BY 
        a."actionId";`,
})

export class ActionViewEntity {
    @Index()
    @ViewColumn()
    id: number

    @ViewColumn()
    sectorsAffected: string[]

    @ViewColumn()
    natImplementors: string[]

    @ViewColumn()
    totalInvestmemt: number

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