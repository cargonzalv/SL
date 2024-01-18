export class Config {
  async getConfigValue(method: () => string) {
    try {
      return method();
    } catch (error) {
      return 'unknown';
    }
  }
}
