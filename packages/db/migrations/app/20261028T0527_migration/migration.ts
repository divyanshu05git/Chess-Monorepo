#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/36be899a249c1458b51e12aa28555c20602233b34652b4b901a969247279422e/contract';
import endContract from '../../snapshots/36be899a249c1458b51e12aa28555c20602233b34652b4b901a969247279422e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/71414a41c2449ce29ec91ee23746545076d5b8c1c20f7c7580568ab174b1bea9/contract';
import startContract from '../../snapshots/71414a41c2449ce29ec91ee23746545076d5b8c1c20f7c7580568ab174b1bea9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
