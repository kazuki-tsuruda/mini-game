// ====== メインエントリーポイント ======
import Phaser from 'phaser';
import { TitleScene } from './scenes/titleScene';
import { MainScene } from './scenes/mainScene';

// ====== 画面サイズ判定 ======
const isPortrait = window.innerHeight > window.innerWidth;
const gameWidth = isPortrait ? 720 : 1280;
const gameHeight = isPortrait ? 1280 : 720;

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
    width: gameWidth,
    height: gameHeight
  },
  scene: [TitleScene, MainScene]
};

// ====== ゲーム初期化 ======
new Phaser.Game(config);
