export class Storage<T extends string> {
  private readonly storage: IStorage;

  public constructor(getStorage = (): IStorage => window.sessionStorage) {
    this.storage = getStorage();
  }

  async get(key: T): Promise<string> {
    return (await this.storage.getItem(key)) || '';
  }

  async set(key: T, value: string): Promise<void> {
    await this.storage.setItem(key, value);
  }
}
