import Phaser from 'phaser';

// ====== ゲーム設定 ======
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;
const GAME_WIDTH = GRID_WIDTH * BLOCK_SIZE;
const GAME_HEIGHT = GRID_HEIGHT * BLOCK_SIZE;

// モバイル判定
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// テトリスのピース定義
interface TetrominoPiece {
  shape: number[][];
  color: number;
}

const TETROMINOS: Record<string, TetrominoPiece> = {
  I: { shape: [[1, 1, 1, 1]], color: 0x00FFFF },
  O: { shape: [[1, 1], [1, 1]], color: 0xFFFF00 },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 0x800080 },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 0x00FF00 },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 0xFF0000 },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 0x0000FF },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 0xFF8000 }
};

export { GAME_WIDTH, GAME_HEIGHT };

export class TetrisScene extends Phaser.Scene {
  private grid!: number[][];
  private gridColors!: number[][];
  private score!: number;
  private level!: number;
  private lines!: number;
  private gameOver!: boolean;
  private dropTime!: number;
  private dropInterval!: number;

  private currentPiece: TetrominoPiece | null = null;
  private currentX!: number;
  private currentY!: number;

  private gridGraphics!: Phaser.GameObjects.Group;
  private pieceGraphics!: Phaser.GameObjects.Group;
  private gameOverText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TetrisScene' });
  }

  preload(): void {
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 1, 1)
      .generateTexture('block', 1, 1);
  }

  create(): void {
    this.setupGame();
    this.setupInput();
    this.setupUI();
    this.startGame();
  }

  private setupGame(): void {
    this.grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
    this.gridColors = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.dropTime = 0;
    this.dropInterval = 1000;

    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;

    this.gridGraphics = this.add.group();
    this.pieceGraphics = this.add.group();

    this.drawGrid();
  }

  private setupInput(): void {
    this.input.keyboard!.on('keydown-LEFT', () => this.movePiece(-1, 0));
    this.input.keyboard!.on('keydown-RIGHT', () => this.movePiece(1, 0));
    this.input.keyboard!.on('keydown-DOWN', () => this.dropPiece());
    this.input.keyboard!.on('keydown-UP', () => this.rotatePiece());
    this.input.keyboard!.on('keydown-SPACE', () => this.hardDrop());
    this.input.keyboard!.on('keydown-R', () => this.restartGame());

    if (isMobile) {
      this.createTouchControls();
    }
  }

  private setupUI(): void {
    this.gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(1000);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.3);

    for (let x = 0; x <= GRID_WIDTH; x++) {
      graphics.moveTo(x * BLOCK_SIZE, 0);
      graphics.lineTo(x * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    }

    for (let y = 0; y <= GRID_HEIGHT; y++) {
      graphics.moveTo(0, y * BLOCK_SIZE);
      graphics.lineTo(GRID_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
    }

    graphics.strokePath();
  }

  private startGame(): void {
    this.spawnNewPiece();
  }

  private spawnNewPiece(): void {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    this.currentPiece = { ...TETROMINOS[randomPiece], shape: TETROMINOS[randomPiece].shape.map(row => [...row]) };

    this.currentX = Math.floor(GRID_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentY = 0;

    if (this.checkCollision(this.currentX, this.currentY, this.currentPiece.shape)) {
      this.endGame();
      return;
    }

    this.drawPiece();
  }

  private movePiece(dx: number, _dy: number): void {
    if (this.gameOver || !this.currentPiece) return;

    const newX = this.currentX + dx;
    const newY = this.currentY;

    if (!this.checkCollision(newX, newY, this.currentPiece.shape)) {
      this.clearPiece();
      this.currentX = newX;
      this.currentY = newY;
      this.drawPiece();
    }
  }

  private dropPiece(): void {
    if (this.gameOver || !this.currentPiece) return;

    if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
      this.clearPiece();
      this.currentY++;
      this.drawPiece();
    } else {
      this.placePiece();
    }
  }

  private rotatePiece(): void {
    if (this.gameOver || !this.currentPiece) return;

    const rotated = this.rotateMatrix(this.currentPiece.shape);

    if (!this.checkCollision(this.currentX, this.currentY, rotated)) {
      this.clearPiece();
      this.currentPiece.shape = rotated;
      this.drawPiece();
    }
  }

  private hardDrop(): void {
    if (this.gameOver || !this.currentPiece) return;

    this.clearPiece();

    while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
      this.currentY++;
    }

    this.drawPiece();
    this.placePiece();
  }

  private createTouchControls(): void {
    const buttonSize = 50;
    const margin = 15;
    const bottomY = GAME_HEIGHT - buttonSize - margin;

    // 左移動ボタン
    const leftBtn = this.add.rectangle(margin + buttonSize / 2, bottomY, buttonSize, buttonSize, 0x333333, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.movePiece(-1, 0));
    leftBtn.setStrokeStyle(2, 0x666666);
    this.add.text(leftBtn.x, leftBtn.y, '\u2190', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    // 右移動ボタン
    const rightBtn = this.add.rectangle(margin * 2 + buttonSize * 1.5, bottomY, buttonSize, buttonSize, 0x333333, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.movePiece(1, 0));
    rightBtn.setStrokeStyle(2, 0x666666);
    this.add.text(rightBtn.x, rightBtn.y, '\u2192', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    // 下移動ボタン
    const downBtn = this.add.rectangle(margin * 3 + buttonSize * 2.5, bottomY, buttonSize, buttonSize, 0x333333, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.dropPiece());
    downBtn.setStrokeStyle(2, 0x666666);
    this.add.text(downBtn.x, downBtn.y, '\u2193', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    // 回転ボタン
    const rotateBtn = this.add.rectangle(GAME_WIDTH - margin - buttonSize / 2, bottomY, buttonSize, buttonSize, 0x666666, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.rotatePiece());
    rotateBtn.setStrokeStyle(2, 0x999999);
    this.add.text(rotateBtn.x, rotateBtn.y, 'かいてん', { fontSize: '8px', color: '#ffffff' }).setOrigin(0.5);

    // ハードドロップボタン
    const hardDropBtn = this.add.rectangle(GAME_WIDTH - margin * 2 - buttonSize * 1.5, bottomY, buttonSize, buttonSize, 0x999999, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.hardDrop());
    hardDropBtn.setStrokeStyle(2, 0xcccccc);
    this.add.text(hardDropBtn.x, hardDropBtn.y, 'ドロップ', { fontSize: '7px', color: '#ffffff' }).setOrigin(0.5);

    // リスタートボタン
    const restartBtn = this.add.rectangle(GAME_WIDTH - margin - buttonSize / 2, margin + buttonSize / 2, buttonSize, buttonSize, 0x444444, 0.8)
      .setInteractive()
      .on('pointerdown', () => this.restartGame());
    restartBtn.setStrokeStyle(2, 0x777777);
    this.add.text(restartBtn.x, restartBtn.y, 'R', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
  }

  private rotateMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = matrix[i][j];
      }
    }

    return rotated;
  }

  private checkCollision(x: number, y: number, shape: number[][]): boolean {
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;

          if (newX < 0 || newX >= GRID_WIDTH ||
            newY >= GRID_HEIGHT ||
            (newY >= 0 && this.grid[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private placePiece(): void {
    if (!this.currentPiece) return;

    for (let py = 0; py < this.currentPiece.shape.length; py++) {
      for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
        if (this.currentPiece.shape[py][px]) {
          const x = this.currentX + px;
          const y = this.currentY + py;
          if (y >= 0) {
            this.grid[y][x] = 1;
            this.gridColors[y][x] = this.currentPiece.color;
          }
        }
      }
    }

    this.clearPiece();
    this.drawFixedBlocks();
    this.checkLines();
    this.spawnNewPiece();
  }

  private checkLines(): void {
    let linesCleared = 0;

    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell === 1)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(GRID_WIDTH).fill(0));
        this.gridColors.splice(y, 1);
        this.gridColors.unshift(Array(GRID_WIDTH).fill(0));

        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

      this.updateUIDisplay();
      this.drawFixedBlocks();
    }
  }

  private drawPiece(): void {
    if (!this.currentPiece) return;

    for (let py = 0; py < this.currentPiece.shape.length; py++) {
      for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
        if (this.currentPiece.shape[py][px]) {
          const x = (this.currentX + px) * BLOCK_SIZE;
          const y = (this.currentY + py) * BLOCK_SIZE;

          if (this.currentY + py >= 0) {
            const block = this.add.rectangle(
              x + BLOCK_SIZE / 2,
              y + BLOCK_SIZE / 2,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2,
              this.currentPiece.color
            );
            block.setStrokeStyle(1, 0xffffff, 0.5);
            this.pieceGraphics.add(block);
          }
        }
      }
    }
  }

  private clearPiece(): void {
    this.pieceGraphics.clear(true, true);
  }

  private drawFixedBlocks(): void {
    this.gridGraphics.clear(true, true);

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (this.grid[y][x]) {
          const block = this.add.rectangle(
            x * BLOCK_SIZE + BLOCK_SIZE / 2,
            y * BLOCK_SIZE + BLOCK_SIZE / 2,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2,
            this.gridColors[y][x]
          );
          block.setStrokeStyle(1, 0xffffff, 0.3);
          this.gridGraphics.add(block);
        }
      }
    }
  }

  private updateUIDisplay(): void {
    const scoreEl = document.getElementById('score-display');
    const levelEl = document.getElementById('level-display');
    const linesEl = document.getElementById('lines-display');
    if (scoreEl) scoreEl.textContent = this.score.toString();
    if (levelEl) levelEl.textContent = this.level.toString();
    if (linesEl) linesEl.textContent = this.lines.toString();
  }

  private endGame(): void {
    this.gameOver = true;
    this.gameOverText.setText('ゲームオーバー\nRボタンをおしてください。');
  }

  private restartGame(): void {
    this.gridGraphics.clear(true, true);
    this.pieceGraphics.clear(true, true);
    this.gameOverText.setText('');
    this.setupGame();
    this.updateUIDisplay();
    this.startGame();
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return;

    this.dropTime += delta;
    if (this.dropTime >= this.dropInterval) {
      this.dropPiece();
      this.dropTime = 0;
    }
  }
}
