// ====== メインエントリーポイント ======
import Phaser from 'phaser';
import { TitleScene } from './scenes/titleScene';
import { MainScene } from './scenes/mainScene';

// ====== Phaser ゲーム設定 ======
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#808080',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-game',
    width: 1280,
    height: 720
  },
  scene: [TitleScene, MainScene]
};

// ====== ゲーム初期化 ======
new Phaser.Game(config);
