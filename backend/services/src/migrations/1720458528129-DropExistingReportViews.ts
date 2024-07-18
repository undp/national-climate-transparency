import { MigrationInterface, QueryRunner } from "typeorm"

export class DropExistingReportViews1720458528129 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS report_six_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_seven_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_eight_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_nine_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_ten_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_eleven_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_twelve_view_entity`);
        await queryRunner.query(`DROP VIEW IF EXISTS report_thirteen_view_entity`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
