import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1754945232457 implements MigrationInterface {
    name = 'DbMigration1754945232457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "electricity_meter" ADD "meterBalance" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" ADD "lastRecharge" date`);
        await queryRunner.query(`ALTER TYPE "public"."electricity_meter_disco_enum" RENAME TO "electricity_meter_disco_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."electricity_meter_disco_enum" AS ENUM('EKEDC', 'IKEDC', 'AEDC', 'IBEDC', 'PHEDC', 'JEDC', 'KEDC', 'BEDC', 'EEDC')`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" ALTER COLUMN "disco" TYPE "public"."electricity_meter_disco_enum" USING "disco"::"text"::"public"."electricity_meter_disco_enum"`);
        await queryRunner.query(`DROP TYPE "public"."electricity_meter_disco_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."electricity_meter_disco_enum_old" AS ENUM('EKEDC', 'IKEDC', 'AEDC', 'IBEDC', 'PHEDC', 'JEDC', 'KEDC', 'BEDC')`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" ALTER COLUMN "disco" TYPE "public"."electricity_meter_disco_enum_old" USING "disco"::"text"::"public"."electricity_meter_disco_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."electricity_meter_disco_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."electricity_meter_disco_enum_old" RENAME TO "electricity_meter_disco_enum"`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" DROP COLUMN "lastRecharge"`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" DROP COLUMN "meterBalance"`);
    }

}
