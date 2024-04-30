import { MigrationInterface, QueryRunner } from "typeorm"
import { actionViewSQL } from "../entities/action.view.entity"
import { programmeViewSQL } from "../entities/programme.view.entity"
import { projectViewSQL } from "../entities/project.view.entity"
import { activityViewSQL } from "../entities/activity.view.entity"

const array_merge_fn = `
CREATE OR REPLACE FUNCTION custom_array_merge(character varying[], character varying[])
RETURNS character varying[] AS $$
DECLARE
    merged_array character varying[];
    element character varying;
BEGIN
    merged_array := $1;
    FOREACH element IN ARRAY $2 LOOP
        IF element NOT IN (SELECT unnest(merged_array)) THEN
            merged_array := merged_array || element;
        END IF;
    END LOOP;
    RETURN merged_array;
END;
$$ LANGUAGE plpgsql;`

const array_agg_fn = `
CREATE AGGREGATE custom_array_agg(character varying[]) (
    SFUNC = custom_array_merge,
    STYPE = character varying[]
);`

const drop_array_agg_fn = `DROP AGGREGATE IF EXISTS custom_array_agg(character varying[]);`;


export class Views1711370952119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
				await queryRunner.query(drop_array_agg_fn);
        await queryRunner.query(array_merge_fn)
        await queryRunner.query(array_agg_fn)

        await queryRunner.query("CREATE MATERIALIZED VIEW activity_view_entity AS" + "\n" + activityViewSQL)
        await queryRunner.query("CREATE MATERIALIZED VIEW project_view_entity AS" + "\n" + projectViewSQL)
        await queryRunner.query("CREATE MATERIALIZED VIEW programme_view_entity AS" + "\n" + programmeViewSQL)
        await queryRunner.query("CREATE MATERIALIZED VIEW action_view_entity AS" + "\n" + actionViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
