import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
  private ball!: Phaser.GameObjects.Arc;
  private paddle!: Phaser.GameObjects.Rectangle;
  private ballBody!: Phaser.Physics.Arcade.Body;
  private paddleBody!: Phaser.Physics.Arcade.StaticBody;

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private elapsedText!: Phaser.GameObjects.Text;
  private isGameOver = false;
  private isStarted = false;

  private startBg!: Phaser.GameObjects.Rectangle;
  private startText!: Phaser.GameObjects.Text;

  private elapsedSec = 0;
  private speedBoosted = false;

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

    // けいか時間表示
    this.elapsedText = this.add.text(16, 16, 'けいか時間: 0びょう', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
    }).setOrigin(0, 0);

    // 入力
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerdown', this.onPointerMove, this);

    // STARTボタン表示
    this.showStartButton();
  }

  private showStartButton(): void {
    const { WIDTH, HEIGHT } = GAME_CONFIG;

    this.startBg = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 200, 50, 0x4488ff)
      .setDepth(11)
      .setInteractive({ useHandCursor: true });

    this.startText = this.add.text(WIDTH / 2, HEIGHT / 2, 'START', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12);

    this.startBg.on('pointerdown', () => {
      this.startBg.destroy();
      this.startText.destroy();
      this.launchBall();
    });
  }

  private launchBall(): void {
    this.isStarted = true;
    this.elapsedSec = 0;
    this.speedBoosted = false;

    const angle = Phaser.Math.Between(200, 340); // 上方向に飛ぶ角度
    const rad = Phaser.Math.DegToRad(angle);
    const speed = GAME_CONFIG.BALL_SPEED;
    this.ballBody.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.isGameOver) return;
    const halfW = GAME_CONFIG.PADDLE_WIDTH / 2;
    const x = Phaser.Math.Clamp(pointer.x, halfW, GAME_CONFIG.WIDTH - halfW);
    this.paddle.setX(x);
    this.paddleBody.reset(x, this.paddle.y);
  }

  update(_time: number, delta: number): void {
    if (!this.isStarted || this.isGameOver) return;

    // 経過秒数を加算し、60秒でスピードアップ
    this.elapsedSec += delta / 1000;
    this.elapsedText.setText(`けいか時間: ${Math.floor(this.elapsedSec)}びょう`);
    if (!this.speedBoosted && this.elapsedSec >= GAME_CONFIG.SPEED_BOOST_SEC) {
      this.speedBoosted = true;
      this.applySpeedBoost();
    }

    // ボールとパドルの衝突
    this.physics.overlap(this.ball, this.paddle, this.onBallHitPaddle, undefined, this);

    // ボールが画面下部を超えたらゲームオーバー
    if (this.ball.y > GAME_CONFIG.HEIGHT + GAME_CONFIG.BALL_RADIUS) {
      this.triggerGameOver();
    }
  }

  private applySpeedBoost(): void {
    const vx = this.ballBody.velocity.x;
    const vy = this.ballBody.velocity.y;
    const currentSpeed = Math.sqrt(vx * vx + vy * vy);
    const boostedSpeed = Math.min(currentSpeed * GAME_CONFIG.SPEED_BOOST_MULTIPLIER, 700);
    const ratio = boostedSpeed / currentSpeed;
    this.ballBody.setVelocity(vx * ratio, vy * ratio);
  }

  private onBallHitPaddle(): void {
    const ballBody = this.ballBody;

    // パドルの中心からのオフセットでX方向の反射角を調整
    const hitOffset = (this.ball.x - this.paddle.x) / (GAME_CONFIG.PADDLE_WIDTH / 2);
    const bounceAngleDeg = hitOffset * 60; // 最大±60度
    const speed = Math.sqrt(ballBody.velocity.x ** 2 + ballBody.velocity.y ** 2);

    const rad = Phaser.Math.DegToRad(-90 + bounceAngleDeg); // 上方向ベース
    ballBody.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);

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
