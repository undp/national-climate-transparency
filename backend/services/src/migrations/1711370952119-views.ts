import { MigrationInterface, QueryRunner } from "typeorm"
import { actionViewSQL } from "../entities/action.view.entity"
import { programmeViewSQL } from "../entities/programme.view.entity"
import { projectViewSQL } from "../entities/project.view.entity"
export class Views1711370952119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query("CREATE MATERIALIZED VIEW project_view_entity AS" + "\n" + projectViewSQL)
        await queryRunner.query("CREATE MATERIALIZED VIEW programme_view_entity AS" + "\n" + programmeViewSQL)
        await queryRunner.query("CREATE MATERIALIZED VIEW action_view_entity AS" + "\n" + actionViewSQL)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
