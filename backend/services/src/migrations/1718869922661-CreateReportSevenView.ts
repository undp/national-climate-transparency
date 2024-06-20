import { reportSevenViewSQL } from "../entities/report.seven.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportSevenView1718869922661 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query("CREATE VIEW report_seven_view_entity AS" + "\n" + reportSevenViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
