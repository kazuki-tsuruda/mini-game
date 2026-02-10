import Phaser from 'phaser';
import { ScoreManager } from '../managers/scoreManager';

// ====== タイトルシーン ======
export class TitleScene extends Phaser.Scene {
  private scoreManager: ScoreManager;

  constructor() {
    super({ key: 'TitleScene' });
    this.scoreManager = new ScoreManager();
  }

  preload(): void {
    this.load.image('background', 'img/background.png');
    this.load.image('startButton', 'img/startButton.png');
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createBestScoreDisplay();
    this.setupDifficultySelector();
    this.createStartButton();
  }

  private createBackground(): void {
    this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'background');
  }

  private createTitle(): void {
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 180, 'シューター', {
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  private createBestScoreDisplay(): void {
    const bestScore = this.scoreManager.getBestScore();
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, `ベストスコア: ${bestScore}`, {
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  private setupDifficultySelector(): void {
    const selector = document.getElementById('strength') as HTMLSelectElement | null;
    if (selector) {
      selector.disabled = false;
      selector.options[1].selected = true;
    }
  }

  private createStartButton(): void {
    const startButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'startButton')
      .setInteractive()
      .setOrigin(0.5);

    startButton.on('pointerdown', () => {
      const selector = document.getElementById('strength') as HTMLSelectElement | null;
      if (selector) {
        selector.disabled = true;
      }
      this.scene.start('MainScene');
    });
  }
}
