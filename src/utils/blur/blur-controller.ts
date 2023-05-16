import { Blur } from './blur';
import { Camera } from './types';

export class BlurController {
  private static _instance: BlurController;

  private readonly confToBlur = new Map<
    pc.CameraComponent,
    Map<string, Blur>
  >();
  private readonly freeBlur = new Set<Blur>();

  public retain(cameraEntity: Camera, iterations: number, factor: number) {
    const camera = cameraEntity.camera;
    let confToBlur = this.confToBlur.get(camera);

    if (!confToBlur) {
      confToBlur = new Map<string, Blur>();
      this.confToBlur.set(camera, confToBlur);
    }

    const conf = `${iterations}:${factor}`;
    let blur = confToBlur.get(conf);

    if (!blur) {
      if (this.freeBlur.size > 0) {
        const freeBlur = this.freeBlur.values().next().value as Blur;

        this.freeBlur.delete(freeBlur);

        blur = freeBlur;
      } else {
        const app = camera.system.app;
        const device = app.graphicsDevice;

        blur = new Blur(device, cameraEntity);
      }
    }

    blur.setIterations(iterations);
    blur.setRadiusFactor(factor);

    confToBlur.set(conf, blur);

    blur.retain();

    return blur;
  }

  public release(cameraEntity: Camera, iterations: number, factor: number) {
    const camera = cameraEntity.camera;
    const confToBlur = this.confToBlur.get(camera);

    if (!confToBlur) {
      return;
    }

    const conf = `${iterations}:${factor}`;
    const blur = confToBlur.get(conf);

    if (!blur) {
      return;
    }

    blur.release();

    if (blur.isFree()) {
      confToBlur.delete(conf);
      this.freeBlur.add(blur);
    }
  }

  public static getInstance() {
    return this._instance || (this._instance = new BlurController());
  }
}
