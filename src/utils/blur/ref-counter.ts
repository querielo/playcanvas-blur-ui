export class RefCounter {
  private _count = 0;

  public get count() {
    return this._count;
  }

  public retain() {
    this._count++;
  }

  public release() {
    this._count--;
  }

  public isFree() {
    return this._count === 0;
  }
}
