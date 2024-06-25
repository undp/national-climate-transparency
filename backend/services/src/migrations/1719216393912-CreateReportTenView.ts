import { reportTenViewSQL } from "../entities/report.ten.view.entity"
import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateReportTenView1719216393912 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE VIEW report_ten_view_entity AS" + "\n" + reportTenViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
