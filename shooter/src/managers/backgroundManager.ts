import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

// ====== 背景マネージャークラス ======
export class BackgroundManager {
  private scene: Phaser.Scene;
  private backgrounds: Phaser.GameObjects.Sprite[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.backgrounds = [];
    this.init();
  }

  private init(): void {
    this.backgrounds[0] = this.scene.add.sprite(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      'background'
    );

    this.backgrounds[1] = this.scene.add.sprite(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - this.scene.scale.height,
      'background'
    );
  }

  update(): void {
    this.backgrounds.forEach((bg) => {
      bg.y += GAME_CONFIG.BACKGROUND_SCROLL_SPEED;

      if (bg.y > this.scene.scale.height * 1.5) {
        bg.y = this.scene.scale.height / 2 - this.scene.scale.height;
      }
    });
  }
}
