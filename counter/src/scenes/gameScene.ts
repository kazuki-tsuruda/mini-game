import Phaser from 'phaser';

// ====== メインゲームシーン ======
// 10秒チャレンジの全ての機能を管理
export class GameScene extends Phaser.Scene {
  private isCounting: boolean;
  private startTime: number;

  // UI要素
  private startButton!: Phaser.GameObjects.Graphics;
  private stopButton!: Phaser.GameObjects.Graphics;
  private counterText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Graphics;
  private startButtonText!: Phaser.GameObjects.Text;
  private stopButtonText!: Phaser.GameObjects.Text;
  private startButtonArea!: Phaser.GameObjects.Zone;
  private stopButtonArea!: Phaser.GameObjects.Zone;

  // データ
  private bestScore: number | null;

  constructor() {
    super({ key: 'GameScene' });

    this.isCounting = false;
    this.startTime = 0;
    this.bestScore = null;
  }

  preload(): void {
    this.loadBestScore();
  }

  create(): void {
    const gw = this.scale.width;
    const gh = this.scale.height;

    this.createBackground(gw, gh);
    this.createCounterDisplay(gw, gh);
    this.createBestScoreDisplay(gw, gh);
    this.createButtons(gw, gh);
    this.createOverlay();
  }

  update(time: number, _delta: number): void {
    if (this.isCounting) {
      this.updateCounter(time);
      this.updateOverlay(time);
    } else {
      this.overlay.clear();
    }
  }

  private createBackground(gw: number, gh: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x6366f1, 0x8b5cf6, 0x06b6d4, 0x3b82f6, 1);
    bg.fillRect(0, 0, gw, gh);

    const circle1 = this.add.graphics();
    circle1.fillStyle(0xffffff, 0.05);
    circle1.fillCircle(gw * 0.2, gh * 0.3, 60);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0xffffff, 0.03);
    circle2.fillCircle(gw * 0.8, gh * 0.7, 80);
  }

  private createCounterDisplay(gw: number, gh: number): void {
    const counterBg = this.add.graphics();
    counterBg.fillStyle(0xffffff, 0.15);
    counterBg.lineStyle(2, 0xffffff, 0.3);
    counterBg.fillRoundedRect(gw / 2 - 140, gh / 2 - 90, 280, 140, 25);
    counterBg.strokeRoundedRect(gw / 2 - 140, gh / 2 - 90, 280, 140, 25);

    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(0x6366f1, 0.1);
    innerGlow.fillRoundedRect(gw / 2 - 135, gh / 2 - 85, 270, 130, 20);

    this.counterText = this.add.text(gw / 2, gh / 2 - 20, '0.00', {
      fontSize: '80px',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif'
    });
    this.counterText.setOrigin(0.5, 0.5);
    this.counterText.setStroke('#6366f1', 2);
    this.counterText.setShadow(0, 0, 'rgba(99, 102, 241, 0.5)', 10, true, true);
  }

  private createBestScoreDisplay(gw: number, gh: number): void {
    this.bestScoreText = this.add.text(gw / 2, gh / 2 + 80,
      this.bestScore ? `ベストスコア: ${this.bestScore.toFixed(2)}秒` : 'ベストスコアなし', {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)'
      });
    this.bestScoreText.setOrigin(0.5, 0.5);
  }

  private createButtons(gw: number, gh: number): void {
    // スタートボタン
    this.startButton = this.add.graphics();
    this.startButton.fillStyle(0xffffff, 0.2);
    this.startButton.lineStyle(1, 0xffffff, 0.3);
    this.startButton.fillRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
    this.startButton.strokeRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);

    this.startButtonText = this.add.text(gw / 2, gh - 90, 'スタート', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.startButtonText.setOrigin(0.5, 0.5);

    this.startButtonArea = this.add.zone(gw / 2, gh - 90, 160, 80);
    this.startButtonArea.setInteractive({ useHandCursor: true })
      .on('pointerdown', this.startTimer.bind(this))
      .on('pointerover', () => {
        this.startButton.clear();
        this.startButton.fillStyle(0xffffff, 0.3);
        this.startButton.lineStyle(1, 0xffffff, 0.5);
        this.startButton.fillRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
        this.startButton.strokeRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
      })
      .on('pointerout', () => {
        this.startButton.clear();
        this.startButton.fillStyle(0xffffff, 0.2);
        this.startButton.lineStyle(1, 0xffffff, 0.3);
        this.startButton.fillRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
        this.startButton.strokeRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
      });

    // ストップボタン
    this.stopButton = this.add.graphics();
    this.stopButtonText = this.add.text(gw / 2, gh - 90, 'ストップ', {
      fontSize: '18px',
      color: '#ffffff'
    });
    this.stopButtonText.setOrigin(0.5, 0.5);
    this.stopButtonText.setVisible(false);

    this.stopButtonArea = this.add.zone(gw / 2, gh - 90, 160, 80);
    this.stopButtonArea.setVisible(false);
    this.stopButtonArea.setInteractive({ useHandCursor: true })
      .on('pointerdown', this.stopTimer.bind(this))
      .on('pointerover', () => {
        this.stopButton.clear();
        this.stopButton.fillStyle(0xff4757, 0.4);
        this.stopButton.lineStyle(1, 0xff4757, 0.6);
        this.stopButton.fillRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
        this.stopButton.strokeRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
      })
      .on('pointerout', () => {
        this.stopButton.clear();
        this.stopButton.fillStyle(0xff4757, 0.3);
        this.stopButton.lineStyle(1, 0xff4757, 0.5);
        this.stopButton.fillRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
        this.stopButton.strokeRoundedRect(gw / 2 - 80, gh - 130, 160, 80, 25);
      });
  }

  private createOverlay(): void {
    this.overlay = this.add.graphics();
    this.overlay.setDepth(1);
  }

  private startTimer(): void {
    this.startButtonArea.setVisible(false);
    this.startButtonText.setVisible(false);
    this.startButton.setVisible(false);

    this.stopButtonArea.setVisible(true);
    this.stopButtonText.setVisible(true);
    this.stopButton.setVisible(true);

    this.stopButton.clear();
    this.stopButton.fillStyle(0xff4757, 0.3);
    this.stopButton.lineStyle(1, 0xff4757, 0.5);
    this.stopButton.fillRoundedRect(this.scale.width / 2 - 80, this.scale.height - 130, 160, 80, 25);
    this.stopButton.strokeRoundedRect(this.scale.width / 2 - 80, this.scale.height - 130, 160, 80, 25);

    this.startTime = this.time.now;
    this.isCounting = true;
  }

  private stopTimer(): void {
    if (!this.isCounting) return;

    this.stopButtonArea.setVisible(false);
    this.stopButtonText.setVisible(false);
    this.stopButton.setVisible(false);

    this.startButtonArea.setVisible(true);
    this.startButtonText.setVisible(true);
    this.startButton.setVisible(true);

    this.startButton.clear();
    this.startButton.fillStyle(0xffffff, 0.2);
    this.startButton.lineStyle(1, 0xffffff, 0.3);
    this.startButton.fillRoundedRect(this.scale.width / 2 - 80, this.scale.height - 130, 160, 80, 25);
    this.startButton.strokeRoundedRect(this.scale.width / 2 - 80, this.scale.height - 130, 160, 80, 25);

    this.isCounting = false;

    const elapsed = this.time.now - this.startTime;
    const elapsedSeconds = elapsed / 1000;
    const difference = Math.abs(elapsedSeconds - 10);

    this.updateBestScore(elapsedSeconds, difference);
  }

  private updateBestScore(elapsedSeconds: number, difference: number): void {
    if (!this.bestScore || difference < Math.abs(this.bestScore - 10)) {
      this.bestScore = elapsedSeconds;
      this.saveBestScore();
      this.bestScoreText.setText(`ベストスコア: ${this.bestScore.toFixed(2)}秒`);
      this.bestScoreText.setColor('#10b981');
    } else {
      this.bestScoreText.setColor('rgba(255, 255, 255, 0.8)');
    }
  }

  private updateCounter(time: number): void {
    const elapsed = time - this.startTime;
    const seconds = elapsed / 1000;
    this.counterText.setText(seconds.toFixed(2));
  }

  private updateOverlay(time: number): void {
    const elapsed = time - this.startTime;
    let hidePercent = 0;

    if (elapsed >= 3000) {
      hidePercent = Math.min((elapsed - 3000) / 2000, 1);
    }

    this.overlay.clear();
    if (hidePercent > 0) {
      const textBounds = this.counterText.getBounds();
      const overlayHeight = textBounds.height * hidePercent;

      this.overlay.fillGradientStyle(0x6366f1, 0x8b5cf6, 0x6366f1, 0x8b5cf6, 1.0);
      this.overlay.fillRoundedRect(
        textBounds.x,
        textBounds.y,
        textBounds.width,
        overlayHeight,
        12
      );

      if (hidePercent > 0.5) {
        this.showHiddenText();
      }
    }
  }

  private showHiddenText(): void {
    const hiddenText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 30,
      '???', {
        fontSize: '40px',
        color: '#ffffff',
        fontFamily: 'Segoe UI, sans-serif'
      });
    hiddenText.setOrigin(0.5, 0.5);
    hiddenText.setDepth(2);
    hiddenText.setStroke('#6366f1', 2);
    hiddenText.setShadow(0, 0, 'rgba(99, 102, 241, 0.8)', 8, true, true);

    this.time.delayedCall(100, () => {
      if (hiddenText) hiddenText.destroy();
    });
  }

  private loadBestScore(): void {
    try {
      const saved = localStorage.getItem('bestScore');
      if (saved) {
        this.bestScore = parseFloat(saved);
      }
    } catch (e) {
      console.log('LocalStorage not available');
    }
  }

  private saveBestScore(): void {
    try {
      if (this.bestScore !== null) {
        localStorage.setItem('bestScore', this.bestScore.toString());
      }
    } catch (e) {
      console.log('LocalStorage not available');
    }
  }
}
