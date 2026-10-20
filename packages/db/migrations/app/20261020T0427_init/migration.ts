#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c6643c8a169d58d07222447363ec3be4b2b6d10893752441ea52105cab9947dc/contract';
import endContract from '../../snapshots/c6643c8a169d58d07222447363ec3be4b2b6d10893752441ea52105cab9947dc/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Game',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('moves', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('player1Id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('player2Id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Game_moves_elem_not_null_8ad5eaf9',
            sql`array_position("moves", NULL) IS NULL`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('username', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Game',
        index: 'Game_player1Id_idx_0738ac2d',
        columns: ['player1Id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Game',
        index: 'Game_player2Id_idx_1e95b759',
        columns: ['player2Id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Game',
        foreignKey: {
          name: 'Game_player1Id_fkey',
          columns: ['player1Id'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Game',
        foreignKey: {
          name: 'Game_player2Id_fkey',
          columns: ['player2Id'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
