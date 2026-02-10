// ====== ブロックゲーム エントリーポイント ======
import Phaser from 'phaser';
import { TetrisScene, GAME_WIDTH, GAME_HEIGHT } from './scenes/tetrisScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-canvas',
  backgroundColor: 'rgba(0,0,0,0.3)',
  transparent: true,
  scene: TetrisScene
};

// ゲーム開始
new Phaser.Game(config);
