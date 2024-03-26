import { MigrationInterface, QueryRunner } from "typeorm"

export class Views1711370952119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE MATERIALIZED VIEW programme_view_entity AS
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
        )

        await queryRunner.query(`
        CREATE MATERIALIZED VIEW action_view_entity AS
        SELECT 
            a."actionId" AS id,
            ARRAY_AGG(DISTINCT fullp.sector) AS "sectorsAffected",
            ARRAY_AGG(DISTINCT fullp.nat_impl) AS "natImplementors",
            ARRAY_AGG(DISTINCT fullp.types) AS types,
            SUM(fullp.investment) AS "totalInvestmemt",
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
            a."actionId";`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
