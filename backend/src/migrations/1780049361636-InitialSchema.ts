import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780049361636 implements MigrationInterface {
  name = 'InitialSchema1780049361636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."championship_category_enum" AS ENUM('U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'Senior')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."championship_gender_enum" AS ENUM('Male', 'Female')`,
    );
    await queryRunner.query(
      `CREATE TABLE "championship" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "season" character varying(9) NOT NULL, "short_code" character varying(10), "category" "public"."championship_category_enum" NOT NULL, "gender" "public"."championship_gender_enum" NOT NULL, "leagueId" integer, CONSTRAINT "PK_56bdaa561586755c210dadc67c5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "league" ("id" SERIAL NOT NULL, "code" character varying(10) NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_b0692665c67729c34eaf1ef6602" UNIQUE ("code"), CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "club" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(20), CONSTRAINT "UQ_6304eab999e5c48c11987fdc148" UNIQUE ("code"), CONSTRAINT "PK_79282481e036a6e0b180afa38aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "officer" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_b9bab694da36794c5065085936c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "venue" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(256), "clubId" integer, CONSTRAINT "PK_c53deb6d1bcb088f9d459e7dbc0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "championshipId" integer, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."team_category_enum" AS ENUM('U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'Senior')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."team_gender_enum" AS ENUM('Male', 'Female')`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "suffix" character varying(10), "category" "public"."team_category_enum" NOT NULL, "gender" "public"."team_gender_enum" NOT NULL, "clubId" integer, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "player" ("id" SERIAL NOT NULL, "last_name" character varying(50) NOT NULL, "first_name" character varying(50) NOT NULL, "search_key" character varying(101), "mergedIntoId" integer, "clubId" integer, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7117bc14dc5e51bd61d155d5d2" ON "player" ("search_key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "coach" ("id" SERIAL NOT NULL, "last_name" character varying(50) NOT NULL, "first_name" character varying(50) NOT NULL, "clubId" integer, CONSTRAINT "PK_c2ca0875fe0755b197d0147713d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game" ("id" SERIAL NOT NULL, "day" date NOT NULL, "time" integer NOT NULL, "game_number" character varying(20) NOT NULL, "score_a" integer, "score_b" integer, "blog_title" character varying(100), "blog_content" text, "venueId" integer, "groupId" integer, "teamAId" integer, "teamBId" integer, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_officer_role_enum" AS ENUM('referee', 'club_delegate', 'time_tracker', 'scorer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_officer" ("id" SERIAL NOT NULL, "role" "public"."game_officer_role_enum" NOT NULL, "rank" integer, "gameId" integer, "officerId" integer, CONSTRAINT "PK_83e1c8622ecdbb174ed7ce4293c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "location" character varying(256) NOT NULL, "hash" character varying(64) NOT NULL, "extractedData" jsonb, "gameId" integer, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_50da2892bca204d060cf562bdf" ON "file" ("hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "player_stat_row" ("id" SERIAL NOT NULL, "number" integer NOT NULL, "starter" boolean NOT NULL, "time_played" integer NOT NULL, "points" integer NOT NULL, "shots_made" integer NOT NULL, "three_pts_made" integer NOT NULL, "two_pts_in_made" integer NOT NULL, "two_pts_out_made" integer NOT NULL, "ft_made" integer NOT NULL, "fouls" integer NOT NULL, "gameId" integer, "playerId" integer, CONSTRAINT "PK_69dc931f63c420b0fe7ced728e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "coach_stat_row" ("id" SERIAL NOT NULL, "fouls" integer NOT NULL, "gameId" integer, "coachId" integer, CONSTRAINT "PK_b01e627c03aceb76091a1e93e9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."team_stat_row_type_enum" AS ENUM('team', 'bench', 'starters', 'first_half', 'second_half', 'overtime')`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_stat_row" ("id" SERIAL NOT NULL, "type" "public"."team_stat_row_type_enum" NOT NULL, "time_played" integer, "points" integer, "shots_made" integer, "three_pts_made" integer, "two_pts_in_made" integer, "two_pts_out_made" integer, "ft_made" integer, "fouls" integer, "gameId" integer, "teamId" integer, CONSTRAINT "PK_c9e49a58694f5a56baa29ef5ae7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_import_status_enum" AS ENUM('pending', 'ready', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_import" ("id" SERIAL NOT NULL, "status" "public"."game_import_status_enum" NOT NULL DEFAULT 'pending', "error_message" text, "filename" character varying(256) NOT NULL, "league_code" character varying(20) NOT NULL, "championship_code" character varying(50) NOT NULL, "group_name" character varying(50) NOT NULL, "game_number" character varying(20) NOT NULL, "game_name" character varying(256), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "extraction_started_at" TIMESTAMP WITH TIME ZONE, "fileId" integer, "gameId" integer, CONSTRAINT "PK_c3966d558bb727aae18fa66498e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship" ADD CONSTRAINT "FK_975a1281ab34091bef8f783436e" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "venue" ADD CONSTRAINT "FK_309c195971b9bcea506957aab65" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_c2800ac7cc9da09cb359375fd30" FOREIGN KEY ("championshipId") REFERENCES "championship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_5a5efe782647948e0a62033bf0f" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_6e266279d735935f22209d5cb06" FOREIGN KEY ("mergedIntoId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_11ec30ccb365809f1630cf14826" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach" ADD CONSTRAINT "FK_71ccc9d8463baaf332513b60475" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_629f40bf37436ef7c5da380578c" FOREIGN KEY ("venueId") REFERENCES "venue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_e8c357728498ef769f8bab224ce" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_4ec86e57461d442f1c7f2a13dfa" FOREIGN KEY ("teamAId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_e883796401302e5c3bf37aaded9" FOREIGN KEY ("teamBId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_officer" ADD CONSTRAINT "FK_065a27dea0455eb710fbbf2cad8" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_officer" ADD CONSTRAINT "FK_76a69a5b2246c3a551c80c770d0" FOREIGN KEY ("officerId") REFERENCES "officer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_46c409ab66a87e309c1bcec1450" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stat_row" ADD CONSTRAINT "FK_0197c9b6a421c243f940d4ae2f1" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stat_row" ADD CONSTRAINT "FK_f22539c62886d2329577d8825d1" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach_stat_row" ADD CONSTRAINT "FK_2685ed9340d5997b60cff5a459c" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach_stat_row" ADD CONSTRAINT "FK_76b89613fed09d51268ba53841a" FOREIGN KEY ("coachId") REFERENCES "coach"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_stat_row" ADD CONSTRAINT "FK_28b8941db53c2e09d353d1d67a0" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_stat_row" ADD CONSTRAINT "FK_39c1d85470203af398b2d7b7a87" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_import" ADD CONSTRAINT "FK_c3fd7f087124c00493d4a4b5305" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_import" ADD CONSTRAINT "FK_59cc07d18c860776044b103ebab" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_import" DROP CONSTRAINT "FK_59cc07d18c860776044b103ebab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_import" DROP CONSTRAINT "FK_c3fd7f087124c00493d4a4b5305"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_stat_row" DROP CONSTRAINT "FK_39c1d85470203af398b2d7b7a87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_stat_row" DROP CONSTRAINT "FK_28b8941db53c2e09d353d1d67a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach_stat_row" DROP CONSTRAINT "FK_76b89613fed09d51268ba53841a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach_stat_row" DROP CONSTRAINT "FK_2685ed9340d5997b60cff5a459c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stat_row" DROP CONSTRAINT "FK_f22539c62886d2329577d8825d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_stat_row" DROP CONSTRAINT "FK_0197c9b6a421c243f940d4ae2f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_46c409ab66a87e309c1bcec1450"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_officer" DROP CONSTRAINT "FK_76a69a5b2246c3a551c80c770d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game_officer" DROP CONSTRAINT "FK_065a27dea0455eb710fbbf2cad8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_e883796401302e5c3bf37aaded9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_4ec86e57461d442f1c7f2a13dfa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_e8c357728498ef769f8bab224ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_629f40bf37436ef7c5da380578c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coach" DROP CONSTRAINT "FK_71ccc9d8463baaf332513b60475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_11ec30ccb365809f1630cf14826"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_6e266279d735935f22209d5cb06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_5a5efe782647948e0a62033bf0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_c2800ac7cc9da09cb359375fd30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venue" DROP CONSTRAINT "FK_309c195971b9bcea506957aab65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "championship" DROP CONSTRAINT "FK_975a1281ab34091bef8f783436e"`,
    );
    await queryRunner.query(`DROP TABLE "game_import"`);
    await queryRunner.query(`DROP TYPE "public"."game_import_status_enum"`);
    await queryRunner.query(`DROP TABLE "team_stat_row"`);
    await queryRunner.query(`DROP TYPE "public"."team_stat_row_type_enum"`);
    await queryRunner.query(`DROP TABLE "coach_stat_row"`);
    await queryRunner.query(`DROP TABLE "player_stat_row"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_50da2892bca204d060cf562bdf"`,
    );
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "game_officer"`);
    await queryRunner.query(`DROP TYPE "public"."game_officer_role_enum"`);
    await queryRunner.query(`DROP TABLE "game"`);
    await queryRunner.query(`DROP TABLE "coach"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7117bc14dc5e51bd61d155d5d2"`,
    );
    await queryRunner.query(`DROP TABLE "player"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TYPE "public"."team_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."team_category_enum"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "venue"`);
    await queryRunner.query(`DROP TABLE "officer"`);
    await queryRunner.query(`DROP TABLE "club"`);
    await queryRunner.query(`DROP TABLE "league"`);
    await queryRunner.query(`DROP TABLE "championship"`);
    await queryRunner.query(`DROP TYPE "public"."championship_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."championship_category_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
