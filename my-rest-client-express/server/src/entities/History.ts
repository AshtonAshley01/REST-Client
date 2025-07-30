import { Entity, PrimaryKey, Property, JsonType } from '@mikro-orm/core';

@Entity()
export class History {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'string' })
  method!: string;

  @Property({ type: 'string' })
  url!: string;

  @Property({ type: 'number', nullable: true })
  statusCode?: number;

  @Property({ type: JsonType, nullable: true })
  responseBody?: object;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();
}