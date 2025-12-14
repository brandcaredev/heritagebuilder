import * as migration_20250131_215554 from './20250131_215554';
import * as migration_20250205_122347 from './20250205_122347';
import * as migration_20250225_202102 from './20250225_202102';
import * as migration_20250319_114207 from './20250319_114207';
import * as migration_20250419_064140 from './20250419_064140';
import * as migration_20250625_104120 from './20250625_104120';
import * as migration_20250707_092106 from './20250707_092106';
import * as migration_20250727_152222 from './20250727_152222';
import * as migration_20251128_181851 from './20251128_181851';
import * as migration_20251203_182404 from './20251203_182404';
import * as migration_20251214_140446 from './20251214_140446';

export const migrations = [
  {
    up: migration_20250131_215554.up,
    down: migration_20250131_215554.down,
    name: '20250131_215554',
  },
  {
    up: migration_20250205_122347.up,
    down: migration_20250205_122347.down,
    name: '20250205_122347',
  },
  {
    up: migration_20250225_202102.up,
    down: migration_20250225_202102.down,
    name: '20250225_202102',
  },
  {
    up: migration_20250319_114207.up,
    down: migration_20250319_114207.down,
    name: '20250319_114207',
  },
  {
    up: migration_20250419_064140.up,
    down: migration_20250419_064140.down,
    name: '20250419_064140',
  },
  {
    up: migration_20250625_104120.up,
    down: migration_20250625_104120.down,
    name: '20250625_104120',
  },
  {
    up: migration_20250707_092106.up,
    down: migration_20250707_092106.down,
    name: '20250707_092106',
  },
  {
    up: migration_20250727_152222.up,
    down: migration_20250727_152222.down,
    name: '20250727_152222',
  },
  {
    up: migration_20251128_181851.up,
    down: migration_20251128_181851.down,
    name: '20251128_181851',
  },
  {
    up: migration_20251203_182404.up,
    down: migration_20251203_182404.down,
    name: '20251203_182404',
  },
  {
    up: migration_20251214_140446.up,
    down: migration_20251214_140446.down,
    name: '20251214_140446'
  },
];
