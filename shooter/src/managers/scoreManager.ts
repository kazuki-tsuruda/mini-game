// ====== スコア管理クラス ======
export class ScoreManager {
  private readonly STORAGE_KEY = 'shooterGameBestScore';

  getBestScore(): number {
    try {
      const savedScore = localStorage.getItem(this.STORAGE_KEY);
      return savedScore ? parseInt(savedScore, 10) : 0;
    } catch (error) {
      console.warn('ベストスコアの読み込みに失敗:', error);
      return 0;
    }
  }

  setBestScore(score: number): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, score.toString());
      return true;
    } catch (error) {
      console.warn('ベストスコアの保存に失敗:', error);
      return false;
    }
  }

  isNewBestScore(currentScore: number): boolean {
    return currentScore > this.getBestScore();
  }

  updateBestScore(currentScore: number): boolean {
    if (this.isNewBestScore(currentScore)) {
      this.setBestScore(currentScore);
      return true;
    }
    return false;
  }

  resetBestScore(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('ベストスコアのリセットに失敗:', error);
      return false;
    }
  }

  clearAllData(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('全データのクリアに失敗:', error);
      return false;
    }
  }
}
