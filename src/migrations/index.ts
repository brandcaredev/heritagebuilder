import * as migration_20250131_215554 from './20250131_215554';
import * as migration_20250205_122347 from './20250205_122347';
import * as migration_20250225_202102 from './20250225_202102';
import * as migration_20250319_114207 from './20250319_114207';

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
    name: '20250319_114207'
  },
];
