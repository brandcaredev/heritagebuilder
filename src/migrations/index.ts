import * as migration_20250131_132916 from './20250131_132916';

export const migrations = [
  {
    up: migration_20250131_132916.up,
    down: migration_20250131_132916.down,
    name: '20250131_132916'
  },
];
