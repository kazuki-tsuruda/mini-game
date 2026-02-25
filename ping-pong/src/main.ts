import Phaser from 'phaser';
import { GameScene } from './scenes/gameScene';
import { GAME_CONFIG } from './config/gameConfig';

// レスポンシブサイズ計算
function calcGameSize(): { width: number; height: number; scale: number } {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const ratio = GAME_CONFIG.WIDTH / GAME_CONFIG.HEIGHT;
  const winRatio = winW / winH;

  let width: number;
  let height: number;

  if (winRatio > ratio) {
    // 横長: 高さ基準
    height = winH;
    width = height * ratio;
  } else {
    // 縦長: 幅基準
    width = winW;
    height = width / ratio;
  }

  return { width, height, scale: width / GAME_CONFIG.WIDTH };
}

const { width, height } = calcGameSize();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#595959',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [GameScene],
  parent: 'phaser-game',
});

export default game;
