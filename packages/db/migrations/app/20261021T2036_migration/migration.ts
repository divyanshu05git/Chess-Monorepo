#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0005a3f2fc95509760d79061ac9d132c883a00510734ae7e9566fc5ae31ee81a/contract';
import endContract from '../../snapshots/0005a3f2fc95509760d79061ac9d132c883a00510734ae7e9566fc5ae31ee81a/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/79302c24f631cc4a5bd07a03b66722e99bb650fbe3038fa01d12314fc315ee24/contract';
import startContract from '../../snapshots/79302c24f631cc4a5bd07a03b66722e99bb650fbe3038fa01d12314fc315ee24/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropNotNull({ schema: 'public', table: 'User', column: 'password' })];
  }
}

MigrationCLI.run(import.meta.url, M);
