import { annexThreeReportSQL } from "../entities/annexThree.view.entity"
import { MigrationInterface, QueryRunner } from "typeorm"

export class AnnexThreeView1720458696280 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE VIEW annex_three_view AS" + "\n" + annexThreeReportSQL)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
