import { Migration } from '@mikro-orm/migrations';

export class Migration20250730143547 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "history" ("id" serial primary key, "method" varchar(255) not null, "url" varchar(255) not null, "status_code" int null, "response_body" jsonb null, "created_at" timestamptz(0) not null default current_timestamp);`);
  }

  override async down(): Promise<void> {
    this.addSql(`select 1`);
  }

}
