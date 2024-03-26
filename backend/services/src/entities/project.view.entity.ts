import { Index, ViewColumn, ViewEntity } from "typeorm"

@ViewEntity({
    materialized: true,
    expression: `
    SELECT 
        prj."projectId" AS id,
        ARRAY_AGG(DISTINCT fullact."techTypes") AS "technologyTypes",
        ARRAY_AGG(DISTINCT fullact."implMeans") AS "implMeans",
        SUM(fullact."requiredAmount") AS "estimatedAmount",
        SUM(fullact."recievedAmount") AS "recievedAmount"
    FROM 
        project prj
    LEFT JOIN (
        SELECT 
            act."activityId",
            act."parentId" AS "projectId",
            UNNEST(act."technologyType") AS "techTypes",
            UNNEST(act."implMeans") AS "implMeans",
            sup."requiredAmount",
            sup."recievedAmount"
        FROM 
            activity act
        LEFT JOIN (
            SELECT 
                "activityId",
                SUM("requiredAmount") AS "requiredAmount",
                SUM("recievedAmount") AS "recievedAmount"
            FROM 
                support
            GROUP BY 
                "activityId"
        ) sup ON act."activityId" = sup."activityId"
    ) fullact ON prj."projectId" = fullact."projectId"
    GROUP BY 
        prj."projectId";`,
})

export class ProjectViewEntity {
    @Index()
    @ViewColumn()
    id: number

    // From Activity

    @ViewColumn()
    implMeans: string[]

    @ViewColumn()
    technologyTypes: string[]

    // From Support

    @ViewColumn()
    estimatedAmount: number

    @ViewColumn()
    recievedAmount: number
}