#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0005a3f2fc95509760d79061ac9d132c883a00510734ae7e9566fc5ae31ee81a/contract';
import startContract from '../../snapshots/0005a3f2fc95509760d79061ac9d132c883a00510734ae7e9566fc5ae31ee81a/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/71414a41c2449ce29ec91ee23746545076d5b8c1c20f7c7580568ab174b1bea9/contract';
import endContract from '../../snapshots/71414a41c2449ce29ec91ee23746545076d5b8c1c20f7c7580568ab174b1bea9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'Game',
        constraint: 'Game_moves_elem_not_null_8ad5eaf9',
      }),
      this.dropColumn({ schema: 'public', table: 'Game', column: 'moves' }),
      this.createTable({
        schema: 'public',
        table: 'Move',
        columns: [
          col('from', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('gameId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('moveNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('playerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('to', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Game',
        column: col('result', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Game',
        column: col('status', 'text', {
          notNull: true,
          default: lit('ONGOING'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'Move',
        constraint: 'Move_gameId_moveNumber_key',
        columns: ['gameId', 'moveNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Move',
        index: 'Move_gameId_idx_6cdb47f8',
        columns: ['gameId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Move',
        index: 'Move_playerId_idx_710cf1aa',
        columns: ['playerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Move',
        foreignKey: {
          name: 'Move_gameId_fkey',
          columns: ['gameId'],
          references: { schema: 'public', table: 'Game', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Move',
        foreignKey: {
          name: 'Move_playerId_fkey',
          columns: ['playerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
