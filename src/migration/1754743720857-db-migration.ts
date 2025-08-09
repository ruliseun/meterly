import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1754743720857 implements MigrationInterface {
    name = 'DbMigration1754743720857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "user_agent" text, "is_revoked" boolean DEFAULT false, "expires" TIMESTAMP, "platform" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."electricity_meter_metertype_enum" AS ENUM('PREPAID', 'POSTPAID')`);
        await queryRunner.query(`CREATE TYPE "public"."electricity_meter_disco_enum" AS ENUM('EKEDC', 'IKEDC', 'AEDC', 'IBEDC', 'PHEDC', 'JEDC', 'KEDC', 'BEDC')`);
        await queryRunner.query(`CREATE TABLE "electricity_meter" ("id" SERIAL NOT NULL, "meterNumber" text NOT NULL, "meterName" text, "meterAddress" text, "meterType" "public"."electricity_meter_metertype_enum" NOT NULL, "disco" "public"."electricity_meter_disco_enum" NOT NULL, "userId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0c25085bcf7475bc920f56a4215" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "fullName" text, "email" text NOT NULL, "phone" text, "nin" text, "isVerified" boolean DEFAULT false, "phoneNumberVerified" boolean DEFAULT false, "country" text DEFAULT 'Nigeria', "address" text, "status" text NOT NULL DEFAULT 'INACTIVE', "password" text, "userAgent" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "password_reset" jsonb, "lastLogin" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "electricity_meter" ADD CONSTRAINT "FK_9c770e68f34abe51cae49ccaf75" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "electricity_meter" DROP CONSTRAINT "FK_9c770e68f34abe51cae49ccaf75"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "electricity_meter"`);
        await queryRunner.query(`DROP TYPE "public"."electricity_meter_disco_enum"`);
        await queryRunner.query(`DROP TYPE "public"."electricity_meter_metertype_enum"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
