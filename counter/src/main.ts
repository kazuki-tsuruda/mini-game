// ====== メインゲーム設定とゲームインスタンス作成 ======
import Phaser from 'phaser';
import { GameScene } from './scenes/gameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 360,
  height: 500,
  parent: 'phaser-game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene]
};

// ゲームインスタンス作成
new Phaser.Game(config);
