import Phaser from 'phaser';
import { DIFFICULTY_SETTINGS, DifficultyConfig } from '../config/gameConfig';

// ====== ユーティリティクラス ======
export class GameUtils {
  static getRandomX(scene: Phaser.Scene): number {
    return Phaser.Math.Between(0, scene.scale.width);
  }

  static getRandomBetween(min: number, max: number): number {
    return Phaser.Math.Between(min, max);
  }

  static clampVelocity(velocity: number, min: number): number {
    return Math.abs(velocity) < min ? (velocity > 0 ? min : -min) : velocity;
  }

  static getDifficultySettings(): DifficultyConfig {
    const selector = document.getElementById('strength') as HTMLSelectElement | null;
    const difficulty = selector?.value || 'normal';
    return DIFFICULTY_SETTINGS[difficulty];
  }
}
