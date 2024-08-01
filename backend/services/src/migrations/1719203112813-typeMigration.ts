import { reportFiveViewSQL } from "../entities/report.five.view.entity";
import { actionViewSQL } from "../entities/action.view.entity";
import { programmeViewSQL } from "../entities/programme.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm"

export class TypeMigration1719203112813 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP INDEX IF EXISTS idx_action_view_entity_id`); // Dropping the action view entity index
        await queryRunner.query(`DROP INDEX IF EXISTS idx_programme_view_entity_id`); // Dropping the programme view entity index
        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_five_view_entity_id`); // Dropping the report five view entity index

        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS report_five_view_entity`); // Dropping the report five view entity
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS action_view_entity`); // Dropping the action view entity 
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS programme_view_entity`); // Dropping the programme view entity
        
        await queryRunner.query("CREATE MATERIALIZED VIEW programme_view_entity AS" + "\n" + programmeViewSQL) // Creating the programme view entity
        await queryRunner.query("CREATE MATERIALIZED VIEW action_view_entity AS" + "\n" + actionViewSQL) // Creating the action view entity 
        await queryRunner.query("CREATE MATERIALIZED VIEW report_five_view_entity AS" + "\n" + reportFiveViewSQL) // Creating the report five entity

        // Creating the dropped indexes

		await queryRunner.query(`
            CREATE UNIQUE INDEX idx_programme_view_entity_id ON programme_view_entity(id);
            CREATE UNIQUE INDEX idx_action_view_entity_id ON action_view_entity(id);
            CREATE UNIQUE INDEX idx_report_five_view_entity_id ON report_five_view_entity(source, "actionId");`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
