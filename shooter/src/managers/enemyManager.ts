import Phaser from 'phaser';
import { GAME_CONFIG, ENEMY_TYPES } from '../config/gameConfig';
import { GameUtils } from '../utils/gameUtils';
import type { MainScene } from '../scenes/mainScene';

// ====== 敵マネージャークラス ======
export class EnemyManager {
  private scene: MainScene;
  private spawnRate: number;
  private nextSpawnTime: number;
  bossSpawned: boolean;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.spawnRate = GAME_CONFIG.ENEMY_SPAWN_RATE;
    this.nextSpawnTime = 0;
    this.bossSpawned = false;
  }

  update(currentTime: number): void {
    if (!this.scene.gameState.isPlaying) return;

    // 通常敵の生成
    if (currentTime > this.nextSpawnTime) {
      this.spawnEnemy();
      this.updateSpawnRate(currentTime);
      this.nextSpawnTime = currentTime + this.spawnRate;
    }

    // ボスの移動更新
    this.updateBossMovement();
  }

  private spawnEnemy(): void {
    const enemyType = Math.random() < 0.5 ? ENEMY_TYPES.BASIC : ENEMY_TYPES.STRONG;
    const enemy = this.scene.enemies.create(
      GameUtils.getRandomX(this.scene),
      -50,
      enemyType.texture
    ) as Phaser.Physics.Arcade.Sprite & { health: number };

    enemy.health = enemyType.health;
    enemy.setVelocityY(GAME_CONFIG.ENEMY_SPEED);
  }

  spawnBoss(): void {
    if (this.bossSpawned) return;

    const difficulty = GameUtils.getDifficultySettings();
    const boss = this.scene.enemyBoss.create(
      this.scene.scale.width / 2,
      0,
      'enemyBoss'
    ) as Phaser.Physics.Arcade.Sprite & { health: number; maxHealth: number };

    boss.health = difficulty.bossHealth;
    boss.maxHealth = difficulty.bossHealth;
    boss.setVelocityY(GAME_CONFIG.BOSS_SPEED);
    this.bossSpawned = true;
  }

  private updateSpawnRate(currentTime: number): void {
    if (currentTime > GAME_CONFIG.ENEMY_SPAWN_RATE_REDUCTION_TIME) {
      this.spawnRate = GAME_CONFIG.ENEMY_SPAWN_RATE2;
    }
  }

  private updateBossMovement(): void {
    this.scene.enemyBoss.getChildren().forEach((child) => {
      const boss = child as Phaser.Physics.Arcade.Sprite;
      const body = boss.body as Phaser.Physics.Arcade.Body;

      if (body.velocity.x === 0 && body.velocity.y === 0) {
        boss.setVelocity(
          GameUtils.getRandomBetween(-100, 100),
          GameUtils.getRandomBetween(-100, 100)
        );
      }

      // 画面端での反転
      this.handleBossScreenBounds(boss);

      // 最小速度の保証
      boss.setVelocityX(GameUtils.clampVelocity(body.velocity.x, 50));
      boss.setVelocityY(GameUtils.clampVelocity(body.velocity.y, 50));
    });
  }

  private handleBossScreenBounds(boss: Phaser.Physics.Arcade.Sprite): void {
    const body = boss.body as Phaser.Physics.Arcade.Body;
    const bounds = {
      left: boss.width / 2,
      right: this.scene.scale.width - boss.width / 2,
      top: boss.height / 2,
      bottom: this.scene.scale.height - boss.height / 2
    };

    if (boss.x >= bounds.right) {
      boss.setVelocityX(-GameUtils.getRandomBetween(50, 100));
    } else if (boss.x <= bounds.left) {
      boss.setVelocityX(GameUtils.getRandomBetween(50, 100));
    }

    if (boss.y >= bounds.bottom) {
      boss.setVelocityY(-GameUtils.getRandomBetween(50, 100));
    } else if (boss.y <= bounds.top) {
      boss.setVelocityY(GameUtils.getRandomBetween(50, 100));
    }
  }
}
