import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateViewIndexes1717392294244 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE UNIQUE INDEX idx_activity_view_entity_id ON activity_view_entity(id);
            CREATE UNIQUE INDEX idx_project_view_entity_id ON project_view_entity(id);
            CREATE UNIQUE INDEX idx_programme_view_entity_id ON programme_view_entity(id);
            CREATE UNIQUE INDEX idx_action_view_entity_id ON action_view_entity(id);
            CREATE UNIQUE INDEX idx_report_five_view_entity_id ON report_five_view_entity(source, "actionId", "programmeId", "projectId");
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
	}
}
