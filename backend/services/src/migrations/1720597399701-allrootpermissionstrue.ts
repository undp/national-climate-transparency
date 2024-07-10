import { MigrationInterface, QueryRunner } from "typeorm";

export class Allrootpermissionstrue1720597399701 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`
            UPDATE "user"
            SET "validatePermission" = '1'::user_validatepermission_enum
            WHERE "role" = 'Root';
        `);
        await queryRunner.query(`
            UPDATE "user"
            SET "subRolePermission" = '1'::user_subrolepermission_enum
            WHERE "role" = 'Root';
        `);
        await queryRunner.query(`
            UPDATE "user"
            SET "ghgInventoryPermission" = '1'::user_ghginventorypermission_enum
            WHERE "role" = 'Root';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
