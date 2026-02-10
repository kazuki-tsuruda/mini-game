import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { GameUtils } from '../utils/gameUtils';
import { GameState } from '../classes/gameState';
import { UIManager } from '../managers/uiManager';
import { BackgroundManager } from '../managers/backgroundManager';
import { PlayerManager } from '../managers/playerManager';
import { EnemyManager } from '../managers/enemyManager';
import { ScoreManager } from '../managers/scoreManager';

// ====== メインシーン ======
export class MainScene extends Phaser.Scene {
  scoreManager!: ScoreManager;
  gameState!: GameState;
  uiManager!: UIManager;
  backgroundManager!: BackgroundManager;
  playerManager!: PlayerManager;
  enemyManager!: EnemyManager;

  // Physics groups
  bullets!: Phaser.Physics.Arcade.Group;
  enemies!: Phaser.Physics.Arcade.Group;
  enemyBoss!: Phaser.Physics.Arcade.Group;
  energies!: Phaser.Physics.Arcade.Group;

  private continueButton!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'MainScene' });
    this.initializeProperties();
  }

  private initializeProperties(): void {
    this.scoreManager = new ScoreManager();
    this.gameState = new GameState(this.scoreManager);
  }

  preload(): void {
    const assets = [
      'background', 'player', 'bullet', 'energy', 'enemy',
      'enemy2', 'enemyBoss', 'explosion', 'continueButton'
    ];

    assets.forEach(asset => {
      this.load.image(asset, `img/${asset}.png`);
    });
  }

  create(): void {
    this.resetGame();
    this.setupManagers();
    this.createPhysicsGroups();
    this.setupUI();
    this.setupInput();
    this.setupTimers();
    this.setupCollisions();
    this.startGame();
  }

  private resetGame(): void {
    this.gameState = new GameState(this.scoreManager);
  }

  private setupManagers(): void {
    this.backgroundManager = new BackgroundManager(this);
    this.playerManager = new PlayerManager(this);
    this.enemyManager = new EnemyManager(this);
    this.uiManager = new UIManager(this);
  }

  private createPhysicsGroups(): void {
    this.bullets = this.physics.add.group();
    this.energies = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.enemyBoss = this.physics.add.group();
  }

  private setupUI(): void {
    this.uiManager.createScoreText();
    this.uiManager.createBestScoreText(this.gameState.getBestScore());
    this.uiManager.createTimeText();
    this.uiManager.createBossHealthUI();
    this.uiManager.createGameOverText();
    this.createContinueButton();
  }

  private createContinueButton(): void {
    this.continueButton = this.add.sprite(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      'continueButton'
    )
      .setInteractive()
      .setOrigin(0.5)
      .setVisible(false);

    this.continueButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameState.isPlaying) {
        this.playerManager.setTarget(pointer.x, pointer.y);
        this.playerManager.fireBullet();
      }
    });
  }

  private setupTimers(): void {
    // エネルギー缶生成
    this.time.addEvent({
      delay: GAME_CONFIG.ENERGY_SPAWN_RATE,
      callback: this.spawnEnergy,
      callbackScope: this,
      loop: true
    });

    // ボス出現
    this.time.addEvent({
      delay: GAME_CONFIG.ENEMY_BOSS_RATE,
      callback: () => this.enemyManager.spawnBoss(),
      callbackScope: this,
      loop: false
    });
  }

  private setupCollisions(): void {
    this.physics.add.overlap(this.bullets, this.enemies, this.destroyEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.bullets, this.enemyBoss, this.destroyEnemyBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.collider(this.playerManager.player, this.enemies, this.endGame as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.collider(this.playerManager.player, this.enemyBoss, this.endGame as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.playerManager.player, this.energies, this.collectEnergy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
  }

  private startGame(): void {
    this.gameState.start(this.time.now);
  }

  update(): void {
    if (!this.gameState.isPlaying && !this.gameState.bossDefeated) return;

    if (this.gameState.bossDefeated) {
      this.handleGameClear();
      return;
    }

    this.backgroundManager.update();
    this.playerManager.update();
    this.enemyManager.update(this.time.now);
    this.updateUI();
  }

  private updateUI(): void {
    this.uiManager.updateScore(this.gameState.score);
    this.uiManager.updateTime(this.gameState.getElapsedTime(this.time.now));

    const boss = this.enemyBoss.getFirstAlive() as (Phaser.Physics.Arcade.Sprite & { health: number; maxHealth: number }) | null;
    if (boss) {
      this.uiManager.updateBossHealth(boss.health, boss.maxHealth);
    } else {
      this.uiManager.updateBossHealth(0, 1);
    }
  }

  private handleGameClear(): void {
    this.gameState.end();
    this.playerManager.setTint(0x00ff00);

    if (this.gameState.isNewBestScore()) {
      this.uiManager.showNewBestScoreMessage();
      this.uiManager.updateBestScore(this.gameState.score);
    }

    this.uiManager.elements.gameOverText?.setText('ゲームクリア！').setVisible(true);
    this.physics.pause();
    this.continueButton.setVisible(true);
  }

  private endGame(): void {
    this.gameState.end();
    this.playerManager.setTint(0xff0000);

    if (this.gameState.isNewBestScore()) {
      this.uiManager.showNewBestScoreMessage();
      this.uiManager.updateBestScore(this.gameState.score);
    }

    this.uiManager.elements.gameOverText?.setText('ゲームオーバー').setVisible(true);
    this.physics.pause();
    this.continueButton.setVisible(true);
  }

  private destroyEnemy(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject): void {
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Phaser.Physics.Arcade.Sprite & { health: number };

    b.destroy();
    e.health -= 1;

    if (e.health <= 0) {
      this.explodeEnemy(e);
      this.gameState.addScore(1);
    } else {
      e.setTint(0xff0000);
    }
  }

  private destroyEnemyBoss(bullet: Phaser.GameObjects.GameObject, boss: Phaser.GameObjects.GameObject): void {
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    const bo = boss as Phaser.Physics.Arcade.Sprite & { health: number };

    b.destroy();
    bo.health--;

    if (bo.health <= 0) {
      this.explodeBoss(bo);
      this.gameState.addScore(10);
    } else {
      bo.setTint(0xff0000);
    }
  }

  private explodeEnemy(enemy: Phaser.Physics.Arcade.Sprite): void {
    enemy.setTexture('explosion');
    enemy.setTint(0xff0000);
    enemy.setVelocityY(0);
    this.time.delayedCall(300, () => enemy.destroy());
  }

  private explodeBoss(boss: Phaser.Physics.Arcade.Sprite): void {
    boss.setTexture('explosion');
    boss.setVelocityX(0);
    this.time.delayedCall(300, () => {
      boss.destroy();
      this.gameState.defeatBoss();
    });
  }

  private spawnEnergy(): void {
    const energy = this.energies.create(
      GameUtils.getRandomX(this),
      -50,
      'energy'
    ) as Phaser.Physics.Arcade.Sprite;
    energy.setVelocityY(GAME_CONFIG.ENEMY_SPEED);
  }

  private collectEnergy(_player: Phaser.GameObjects.GameObject, energy: Phaser.GameObjects.GameObject): void {
    (energy as Phaser.Physics.Arcade.Sprite).destroy();
    this.playerManager.activateEnergyMode();
  }
}
