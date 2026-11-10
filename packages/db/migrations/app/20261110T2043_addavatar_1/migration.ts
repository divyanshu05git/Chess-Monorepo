#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3b6e254eaf6f85c9a620982a4e0d4d8d60cd4ed6cd25509ef50e8c630d3d1c20/contract';
import endContract from '../../snapshots/3b6e254eaf6f85c9a620982a4e0d4d8d60cd4ed6cd25509ef50e8c630d3d1c20/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fb8a208487f962ed183271302b03215b913a62a9a25b347adfdd009c0a37e0e4/contract';
import startContract from '../../snapshots/fb8a208487f962ed183271302b03215b913a62a9a25b347adfdd009c0a37e0e4/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('avatar', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
