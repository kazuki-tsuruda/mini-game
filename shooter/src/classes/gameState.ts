import { ScoreManager } from '../managers/scoreManager';

// ====== ゲーム状態管理クラス ======
export class GameState {
  isPlaying: boolean;
  startTime: number;
  score: number;
  bossDefeated: boolean;
  scoreManager: ScoreManager | null;
  newBestScore: boolean;

  constructor(scoreManager: ScoreManager | null = null) {
    this.isPlaying = false;
    this.startTime = 0;
    this.score = 0;
    this.bossDefeated = false;
    this.scoreManager = scoreManager;
    this.newBestScore = false;
  }

  start(currentTime: number): void {
    this.isPlaying = true;
    this.startTime = currentTime;
    this.score = 0;
    this.bossDefeated = false;
    this.newBestScore = false;
  }

  end(): void {
    this.isPlaying = false;
    // ゲーム終了時にベストスコアをチェック・更新
    if (this.scoreManager && this.scoreManager.updateBestScore(this.score)) {
      this.newBestScore = true;
    }
  }

  addScore(points: number): void {
    this.score += points;
  }

  getElapsedTime(currentTime: number): number {
    return Math.floor((currentTime - this.startTime) / 1000);
  }

  defeatBoss(): void {
    this.bossDefeated = true;
  }

  getBestScore(): number {
    return this.scoreManager ? this.scoreManager.getBestScore() : 0;
  }

  isNewBestScore(): boolean {
    return this.newBestScore;
  }
}
