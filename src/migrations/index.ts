import * as migration_20250131_215554 from './20250131_215554';
import * as migration_20250205_122347 from './20250205_122347';

export const migrations = [
  {
    up: migration_20250131_215554.up,
    down: migration_20250131_215554.down,
    name: '20250131_215554',
  },
  {
    up: migration_20250205_122347.up,
    down: migration_20250205_122347.down,
    name: '20250205_122347'
  },
];
