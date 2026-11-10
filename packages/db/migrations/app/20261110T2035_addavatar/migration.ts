#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/36be899a249c1458b51e12aa28555c20602233b34652b4b901a969247279422e/contract';
import startContract from '../../snapshots/36be899a249c1458b51e12aa28555c20602233b34652b4b901a969247279422e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/3b6e254eaf6f85c9a620982a4e0d4d8d60cd4ed6cd25509ef50e8c630d3d1c20/contract';
import endContract from '../../snapshots/3b6e254eaf6f85c9a620982a4e0d4d8d60cd4ed6cd25509ef50e8c630d3d1c20/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'Game', column: 'updatedAt' }),
      this.addColumn({
        schema: 'public',
        table: 'Game',
        column: col('endAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Game',
        column: col('timeControl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('avatar', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'Game',
        column: col('status', 'text', {
          default: lit('IN_PROGRESS'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Game',
        constraint: 'Game_result_check_df6ba410',
        expression: sql`"result" IN ('WHITE_WINS', 'BLACK_WINS', 'DRAW')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Game',
        constraint: 'Game_status_check_803570ff',
        expression: sql`"status" IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIME_UP', 'PLAYER_EXIT')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Game',
        constraint: 'Game_timeControl_check_3f660a42',
        expression: sql`"timeControl" IN ('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
