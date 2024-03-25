import { DataSource, Index, ViewColumn, ViewEntity } from "typeorm"
import { ActionEntity } from "./action.entity"
import { ProgrammeEntity } from "./programme.entity"

@ViewEntity({
    materialized: true,
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .from(ActionEntity, "a")
            .leftJoin(ProgrammeEntity, 'p', "a.actionId = p.actionId")
            .select(["a.actionId AS id"])
            .addSelect("ARRAY_AGG(DISTINCT p.affectedSectors) AS sectors")
            .addSelect("SUM(p.investment) AS total_investment")
            .addSelect("ARRAY_AGG(DISTINCT p.natImplementor) AS nat_implementors")
            .groupBy("a.actionId")
})
export class ActionViewEntity {
    @Index()
    @ViewColumn()
    id: number

    @ViewColumn()
    sectors: string[]

    @ViewColumn()
    total_investmemt: number

    @ViewColumn()
    nat_implementors: string[]
}