import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import type { MainScene } from '../scenes/mainScene';

// ====== プレイヤーマネージャークラス ======
export class PlayerManager {
  private scene: MainScene;
  player!: Phaser.Physics.Arcade.Sprite;
  private targetX: number;
  private targetY: number;
  private energyMode: {
    active: boolean;
    count: number;
    maxCount: number;
  };

  constructor(scene: MainScene) {
    this.scene = scene;
    this.targetX = 0;
    this.targetY = 0;
    this.energyMode = {
      active: false,
      count: 0,
      maxCount: 1000
    };
    this.init();
  }

  private init(): void {
    this.player = this.scene.physics.add.sprite(
      this.scene.scale.width / 2,
      this.scene.scale.height - 200,
      'player'
    );
    this.player.setCollideWorldBounds(true);
    this.targetX = this.player.x;
    this.targetY = this.player.y;
  }

  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  update(): void {
    this.updatePosition();
    this.updateEnergyMode();
  }

  private updatePosition(): void {
    const deltaX = this.targetX - this.player.x;
    const deltaY = this.targetY - this.player.y;

    if (Math.abs(deltaX) > GAME_CONFIG.PLAYER_SPEED) {
      this.player.x += Math.sign(deltaX) * GAME_CONFIG.PLAYER_SPEED;
    } else {
      this.player.x = this.targetX;
    }

    if (Math.abs(deltaY) > GAME_CONFIG.PLAYER_SPEED) {
      this.player.y += Math.sign(deltaY) * GAME_CONFIG.PLAYER_SPEED;
    } else {
      this.player.y = this.targetY;
    }
  }

  private updateEnergyMode(): void {
    if (this.energyMode.active && this.scene.gameState.isPlaying) {
      this.fireEnergyBullet();
    }
  }

  fireBullet(): void {
    if (!this.scene.gameState.isPlaying) return;

    const bullet = this.scene.bullets.create(this.player.x, this.player.y - 50, 'bullet') as Phaser.Physics.Arcade.Sprite;
    bullet.setVelocityY(-GAME_CONFIG.BULLET_SPEED);
  }

  private fireEnergyBullet(): void {
    if (this.energyMode.count < this.energyMode.maxCount) {
      const bullet = this.scene.bullets.create(this.player.x, this.player.y - 50, 'bullet') as Phaser.Physics.Arcade.Sprite;
      bullet.setVelocityY(-GAME_CONFIG.ENERGY_BULLET_SPEED);
      this.energyMode.count++;
    } else {
      this.energyMode.active = false;
      this.energyMode.count = 0;
    }
  }

  activateEnergyMode(): void {
    this.energyMode.count = 0;
    this.energyMode.active = true;
  }

  setTint(color: number): void {
    this.player.setTint(color);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.player.x, y: this.player.y };
  }
}
