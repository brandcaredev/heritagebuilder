import * as migration_20250131_215554 from './20250131_215554';
import * as migration_20250205_122347 from './20250205_122347';
import * as migration_20250225_202102 from './20250225_202102';
import * as migration_20250319_114207 from './20250319_114207';
import * as migration_20250419_064140 from './20250419_064140';
import * as migration_20250625_104120 from './20250625_104120';
import * as migration_20250707_092106 from './20250707_092106';

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
    name: '20250707_092106'
  },
];
