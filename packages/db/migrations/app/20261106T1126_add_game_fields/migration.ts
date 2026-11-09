#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/39dc9a464fe63abd06f89e941b8ce75fbfdcaf3e84a90318c2da3b0c0df8a25e/contract';
import startContract from '../../snapshots/39dc9a464fe63abd06f89e941b8ce75fbfdcaf3e84a90318c2da3b0c0df8a25e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fb8a208487f962ed183271302b03215b913a62a9a25b347adfdd009c0a37e0e4/contract';
import endContract from '../../snapshots/fb8a208487f962ed183271302b03215b913a62a9a25b347adfdd009c0a37e0e4/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropNotNull({ schema: 'public', table: 'Game', column: 'timeControl' })];
  }
}

MigrationCLI.run(import.meta.url, M);
