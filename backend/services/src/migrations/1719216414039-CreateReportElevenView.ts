import { reportElevenViewSQL } from "../entities/report.eleven.view.entity"
import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateReportElevenView1719216414039 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE VIEW report_eleven_view_entity AS" + "\n" + reportElevenViewSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
