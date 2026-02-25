export class ScoreManager {
  private readonly STORAGE_KEY = 'pingPongBestScore';

  getBestScore(): number {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.warn('ベストスコアの読み込みに失敗:', error);
      return 0;
    }
  }

  updateBestScore(currentScore: number): boolean {
    if (currentScore > this.getBestScore()) {
      try {
        localStorage.setItem(this.STORAGE_KEY, currentScore.toString());
        return true;
      } catch (error) {
        console.warn('ベストスコアの保存に失敗:', error);
      }
    }
    return false;
  }
}
