import { reportSixViewSQL } from "../entities/report.six.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportSixView1718787117191 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query("CREATE VIEW report_six_view_entity AS" + "\n" + reportSixViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
