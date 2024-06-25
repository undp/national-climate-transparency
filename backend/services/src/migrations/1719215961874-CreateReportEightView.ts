import { reportEightViewSQL } from "../entities/report.eight.view.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportEightView1719215961874 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query("CREATE VIEW report_eight_view_entity AS" + "\n" + reportEightViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
