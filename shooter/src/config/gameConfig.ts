// ====== ゲーム設定 ======
export const GAME_CONFIG = {
  ENEMY_SPAWN_RATE: 3000,                 // 敵機を生成する間隔（ミリ秒）
  ENEMY_SPAWN_RATE2: 1000,                // 敵機を生成する間隔（ミリ秒）
  ENEMY_SPAWN_RATE_REDUCTION_TIME: 10000, // 敵生成間隔を短縮する時間（ミリ秒）
  ENEMY_BOSS_RATE: 50000,                 // ボス敵機を生成する間隔（ミリ秒）
  ENERGY_SPAWN_RATE: 60000,               // エネルギー缶を生成する間隔（ミリ秒）
  PLAYER_SPEED: 5,                        // プレイヤーの移動速度
  BULLET_SPEED: 300,                      // 弾の速度
  ENERGY_BULLET_SPEED: 600,               // エネルギー弾の速度
  ENEMY_SPEED: 100,                       // 敵機の移動速度
  BOSS_SPEED: 50,                         // ボス敵機の移動速度
  BACKGROUND_SCROLL_SPEED: 0.5            // 背景のスクロール速度
} as const;

// ====== 難易度設定 ======
export interface DifficultyConfig {
  bossHealth: number;
  label: string;
}

export const DIFFICULTY_SETTINGS: Record<string, DifficultyConfig> = {
  strong: { bossHealth: 500, label: 'つよい' },
  normal: { bossHealth: 250, label: 'ふつう' },
  weak: { bossHealth: 50, label: 'よわい' }
};

// ====== 敵の種類 ======
export interface EnemyTypeConfig {
  texture: string;
  health: number;
}

export const ENEMY_TYPES: Record<string, EnemyTypeConfig> = {
  BASIC: { texture: 'enemy', health: 1 },
  STRONG: { texture: 'enemy2', health: 2 }
};
