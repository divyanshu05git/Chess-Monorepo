#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/79302c24f631cc4a5bd07a03b66722e99bb650fbe3038fa01d12314fc315ee24/contract';
import endContract from '../../snapshots/79302c24f631cc4a5bd07a03b66722e99bb650fbe3038fa01d12314fc315ee24/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c6643c8a169d58d07222447363ec3be4b2b6d10893752441ea52105cab9947dc/contract';
import startContract from '../../snapshots/c6643c8a169d58d07222447363ec3be4b2b6d10893752441ea52105cab9947dc/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'User',
        column: 'googleId',
        type: 'text',
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_googleId_key',
        columns: ['googleId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
