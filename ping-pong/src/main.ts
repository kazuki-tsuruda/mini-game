import Phaser from 'phaser';
import { GameScene } from './scenes/gameScene';

// 縦画面・横画面でゲームサイズを切り替え
const isPortrait = window.innerHeight > window.innerWidth;
const gameWidth  = isPortrait ? 720  : 1280;
const gameHeight = isPortrait ? 1280 : 720;

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#595959',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-game',
    width: gameWidth,
    height: gameHeight,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [GameScene],
});
