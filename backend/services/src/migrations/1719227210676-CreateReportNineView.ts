import { reportNineViewSQL } from "../entities/report.nine.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportNineView1719227210676 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query("CREATE VIEW report_nine_view_entity AS" + "\n" + reportNineViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
