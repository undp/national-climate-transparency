import { Index, ViewColumn, ViewEntity } from "typeorm"

export const activityViewSQL = `
SELECT 
    a."activityId" AS id,
    subltree(a.path, 0, 1)::character varying AS action,
    finance."totalRequired",
    finance."totalReceived"
FROM 
    activity a
LEFT JOIN (
    SELECT 
        "activityId" AS id,
        SUM("requiredAmount") AS "totalRequired",
        SUM("receivedAmount") AS "totalReceived"
    FROM 
        public.support
    GROUP BY 
        "activityId"
) finance ON a."activityId" = finance.id;`

@ViewEntity({
    name: 'activity_view_entity',
    materialized: true,
    expression: activityViewSQL,
    synchronize: false,
})
export class ActivityViewEntity {
    @Index()
    @ViewColumn()
    id: number

    // From Activity

    @ViewColumn()
    action: string

    // From Support

    @ViewColumn()
    totalRequired: number

    @ViewColumn()
    totalReceived: number
}