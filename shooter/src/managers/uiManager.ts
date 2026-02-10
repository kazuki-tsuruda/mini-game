import Phaser from 'phaser';

// ====== UIマネージャークラス ======

interface UIElements {
  scoreText?: Phaser.GameObjects.Text;
  bestScoreText?: Phaser.GameObjects.Text;
  timeText?: Phaser.GameObjects.Text;
  bossHealthText?: Phaser.GameObjects.Text;
  bossHealthBarBg?: Phaser.GameObjects.Rectangle;
  bossHealthBarFill?: Phaser.GameObjects.Rectangle;
  gameOverText?: Phaser.GameObjects.Text;
}

export class UIManager {
  private scene: Phaser.Scene;
  elements: UIElements;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.elements = {};
  }

  createScoreText(): Phaser.GameObjects.Text {
    this.elements.scoreText = this.scene.add.text(10, 10, 'スコア: 0', {
      fontSize: '48px',
      color: '#000000'
    });
    return this.elements.scoreText;
  }

  createBestScoreText(bestScore: number = 0): Phaser.GameObjects.Text {
    this.elements.bestScoreText = this.scene.add.text(10, 70, `ベストスコア: ${bestScore}`, {
      fontSize: '32px',
      color: '#444444'
    });
    return this.elements.bestScoreText;
  }

  createTimeText(): Phaser.GameObjects.Text {
    this.elements.timeText = this.scene.add.text(this.scene.scale.width - 10, 10, 'けいか時間: 0', {
      fontSize: '48px',
      color: '#000000'
    }).setOrigin(1, 0);
    return this.elements.timeText;
  }

  createBossHealthUI(): {
    text: Phaser.GameObjects.Text;
    background: Phaser.GameObjects.Rectangle;
    fill: Phaser.GameObjects.Rectangle;
  } {
    const x = 300, y = 120;

    this.elements.bossHealthText = this.scene.add.text(x, y, '', {
      fontSize: '48px',
      color: '#FF8888'
    });

    this.elements.bossHealthBarBg = this.scene.add.rectangle(x, y + 70, 300, 20, 0x555555)
      .setOrigin(0, 0)
      .setVisible(false);

    this.elements.bossHealthBarFill = this.scene.add.rectangle(x, y + 70, 300, 20, 0xff4444)
      .setOrigin(0, 0)
      .setVisible(false);

    return {
      text: this.elements.bossHealthText,
      background: this.elements.bossHealthBarBg,
      fill: this.elements.bossHealthBarFill
    };
  }

  createGameOverText(): Phaser.GameObjects.Text {
    this.elements.gameOverText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      '',
      {
        fontSize: '96px',
        color: '#FF0000'
      }
    ).setOrigin(0.5).setVisible(false);

    return this.elements.gameOverText;
  }

  updateScore(score: number): void {
    this.elements.scoreText?.setText(`スコア: ${score}`);
  }

  updateBestScore(bestScore: number): void {
    this.elements.bestScoreText?.setText(`ベストスコア: ${bestScore}`);
  }

  showNewBestScoreMessage(): void {
    const message = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - 200,
      '🎉 新記録！ 🎉',
      {
        fontSize: '64px',
        color: '#FFD700',
        stroke: '#FF4444',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    this.scene.time.delayedCall(3000, () => {
      message.destroy();
    });
  }

  updateTime(time: number): void {
    this.elements.timeText?.setText(`けいか時間: ${time}`);
  }

  updateBossHealth(health: number, maxHealth: number): void {
    const ratio = Phaser.Math.Clamp(health / maxHealth, 0, 1);

    if (health > 0) {
      this.elements.bossHealthText?.setText(`ボス体力: ${health}`).setVisible(true);
      if (this.elements.bossHealthBarFill) {
        this.elements.bossHealthBarFill.width = 300 * ratio;
      }
      this.elements.bossHealthBarBg?.setVisible(true);
      this.elements.bossHealthBarFill?.setVisible(true);
    } else {
      this.elements.bossHealthText?.setVisible(false);
      this.elements.bossHealthBarBg?.setVisible(false);
      this.elements.bossHealthBarFill?.setVisible(false);
    }
  }
}
