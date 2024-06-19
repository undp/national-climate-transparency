import { reportThirteenViewSQL } from "../entities/report.thirteen.view.entity"
import { reportTwelveViewSQL } from "../entities/report.twelve.view.entity"
import { MigrationInterface, QueryRunner } from "typeorm"

export class ReportViews1718786490845 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const viewExistsQuery = (viewName: string) => `
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.views 
                WHERE table_name = '${viewName}'
            )`;

        const checkViewExists = async (viewName: string): Promise<boolean> => {
            const result = await queryRunner.query(viewExistsQuery(viewName));
            return result[0].exists;
        };

        if (!await checkViewExists('report_twelve_view_entity')) {
            await queryRunner.query("CREATE VIEW report_twelve_view_entity AS" + "\n" + reportTwelveViewSQL);
        }

        if (!await checkViewExists('report_thirteen_view_entity')) {
            await queryRunner.query("CREATE VIEW report_thirteen_view_entity AS" + "\n" + reportThirteenViewSQL);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
