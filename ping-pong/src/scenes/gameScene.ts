import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

// チュートリアルメッセージの定義
interface TutorialStep {
  text: string;
  targetX: number;
  targetY: number;
  side: 'left' | 'right';
  delay: number;
}

export class GameScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc;
  private paddle!: Phaser.GameObjects.Rectangle;
  private ballBody!: Phaser.Physics.Arcade.Body;
  private paddleBody!: Phaser.Physics.Arcade.StaticBody;

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private isGameOver = false;
  private isGameStarted = false;

  private tutorialGraphics: Phaser.GameObjects.GameObject[] = [];
  private currentTutorialStep = 0;
  private tutorialSteps!: TutorialStep[];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 背景
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, GAME_CONFIG.BACKGROUND_COLOR);

    // パドル
    const paddleY = HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET;
    this.paddle = this.add.rectangle(WIDTH / 2, paddleY, GAME_CONFIG.PADDLE_WIDTH, GAME_CONFIG.PADDLE_HEIGHT, 0xffffff);
    this.physics.add.existing(this.paddle, true);
    this.paddleBody = this.paddle.body as Phaser.Physics.Arcade.StaticBody;

    // ボール
    this.ball = this.add.circle(WIDTH / 2, HEIGHT / 2, GAME_CONFIG.BALL_RADIUS, 0xffffff);
    this.physics.add.existing(this.ball);
    this.ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
    this.ballBody.setCollideWorldBounds(true);
    this.ballBody.setBounce(1, 1);
    this.ballBody.setCircle(GAME_CONFIG.BALL_RADIUS);

    // 物理境界 (下辺はゲームオーバー判定のため世界の境界に含めない)
    this.physics.world.setBoundsCollision(true, true, true, false);

    // スコア表示
    this.scoreText = this.add.text(WIDTH / 2, 20, 'スコア: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5, 0);

    // 入力
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerdown', this.onPointerMove, this);

    // チュートリアルステップの設定
    this.tutorialSteps = [
      {
        text: 'ボールは壁やパネルに当たると跳ね返ります。',
        targetX: this.ball.x,
        targetY: this.ball.y,
        side: 'left',
        delay: 500,
      },
      {
        text: 'パネルは左右に動かせます。\nPC画面ではマウスクリック、スマホ画\n面ではタップで移動します。',
        targetX: this.paddle.x,
        targetY: this.paddle.y,
        side: 'right',
        delay: 500,
      },
      {
        text: 'ボールが下に付くとゲームオーバーです',
        targetX: WIDTH - 40,
        targetY: HEIGHT - 60,
        side: 'right',
        delay: 500,
      },
    ];

    // チュートリアル開始
    this.showNextTutorial();
  }

  // --------- チュートリアル ---------

  private showNextTutorial(): void {
    if (this.currentTutorialStep >= this.tutorialSteps.length) {
      this.startGame();
      return;
    }

    const step = this.tutorialSteps[this.currentTutorialStep];
    this.time.delayedCall(step.delay, () => {
      this.showTutorialBubble(step, () => {
        this.currentTutorialStep++;
        this.showNextTutorial();
      });
    });
  }

  private showTutorialBubble(step: TutorialStep, onComplete: () => void): void {
    const { WIDTH } = GAME_CONFIG;

    // 吹き出しのサイズ・位置を決定
    const bubbleW = 220;
    const bubbleH = 90;
    const arrowSize = 20;
    const padding = 12;

    // 吹き出しの左上座標
    let bx: number;
    let by: number;

    if (step.side === 'left') {
      bx = Math.max(10, step.targetX - bubbleW - arrowSize);
      by = Math.max(10, step.targetY - bubbleH / 2);
    } else {
      bx = Math.min(WIDTH - bubbleW - 10, step.targetX - bubbleW / 2);
      by = Math.max(10, step.targetY - bubbleH - arrowSize);
    }

    const graphics = this.add.graphics();
    const alpha = 0.85;
    const fillColor = 0xf4a070;

    // 吹き出し本体
    graphics.fillStyle(fillColor, alpha);
    graphics.fillRoundedRect(bx, by, bubbleW, bubbleH, 8);

    // 矢印（ターゲットに向けて）
    if (step.side === 'left') {
      // 右辺から矢印
      const ax = bx + bubbleW;
      const ay = by + bubbleH / 2;
      graphics.fillTriangle(ax, ay - 10, ax, ay + 10, step.targetX, step.targetY);
    } else {
      // 下辺から矢印
      const ax = Math.min(Math.max(step.targetX, bx + 20), bx + bubbleW - 20);
      const ay = by + bubbleH;
      graphics.fillTriangle(ax - 10, ay, ax + 10, ay, step.targetX, step.targetY);
    }

    const text = this.add.text(bx + padding, by + padding, step.text, {
      fontSize: '13px',
      color: '#222222',
      fontFamily: 'sans-serif',
      wordWrap: { width: bubbleW - padding * 2 },
      lineSpacing: 4,
    });

    this.tutorialGraphics.push(graphics, text);

    // 一定時間後に消す
    this.time.delayedCall(GAME_CONFIG.TUTORIAL_DURATION, () => {
      graphics.destroy();
      text.destroy();
      onComplete();
    });
  }

  private startGame(): void {
    this.isGameStarted = true;

    // ボールを初期速度で発射
    const angle = Phaser.Math.Between(200, 340); // 上方向に飛ぶ角度
    const rad = Phaser.Math.DegToRad(angle);
    const speed = GAME_CONFIG.BALL_SPEED;
    this.ballBody.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
  }

  // --------- ポインター操作 ---------

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isGameOver) return;
    const halfW = GAME_CONFIG.PADDLE_WIDTH / 2;
    const x = Phaser.Math.Clamp(pointer.x, halfW, GAME_CONFIG.WIDTH - halfW);
    this.paddle.setX(x);
    this.paddleBody.reset(x, this.paddle.y);
  }

  // --------- 更新処理 ---------

  update(): void {
    if (!this.isGameStarted || this.isGameOver) return;

    // ボールとパドルの衝突
    this.physics.overlap(this.ball, this.paddle, this.onBallHitPaddle, undefined, this);

    // ボールが画面下部を超えたらゲームオーバー
    if (this.ball.y > GAME_CONFIG.HEIGHT + GAME_CONFIG.BALL_RADIUS) {
      this.triggerGameOver();
    }
  }

  private onBallHitPaddle(): void {
    const ballBody = this.ballBody;

    // パドルの中心からのオフセットでX方向の反射角を調整
    const hitOffset = (this.ball.x - this.paddle.x) / (GAME_CONFIG.PADDLE_WIDTH / 2);
    const bounceAngleDeg = hitOffset * 60; // 最大±60度
    const speed = Math.sqrt(ballBody.velocity.x ** 2 + ballBody.velocity.y ** 2) + GAME_CONFIG.BALL_SPEED_INCREMENT;

    const clampedSpeed = Math.min(speed, 700);
    const rad = Phaser.Math.DegToRad(-90 + bounceAngleDeg); // 上方向ベース
    ballBody.setVelocity(Math.cos(rad) * clampedSpeed, Math.sin(rad) * clampedSpeed);

    // スコア加算
    this.score++;
    this.scoreText.setText(`スコア: ${this.score}`);
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    this.ballBody.setVelocity(0, 0);

    const { WIDTH, HEIGHT } = GAME_CONFIG;

    // 暗転オーバーレイ
    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.6);
    overlay.setDepth(10);

    // ゲームオーバーテキスト
    this.add.text(WIDTH / 2, HEIGHT / 2 - 60, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11);

    this.add.text(WIDTH / 2, HEIGHT / 2, `スコア: ${this.score}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(11);

    // リトライボタン
    const retryBg = this.add.rectangle(WIDTH / 2, HEIGHT / 2 + 70, 200, 50, 0x4488ff).setDepth(11).setInteractive({ useHandCursor: true });
    this.add.text(WIDTH / 2, HEIGHT / 2 + 70, 'もう一度', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(12);

    retryBg.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
