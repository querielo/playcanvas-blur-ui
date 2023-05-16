import { createScript } from '../utils/createScript';
import { BlurController } from '../utils/blur/blur-controller';
import { Blur } from '../utils/blur/blur';
import { Camera } from '../utils/blur/types';

@createScript({
  camera: {
    type: 'entity',
  },
  iterations: {
    type: 'number',
    default: 8,
    description: `Number of blur iterations.
Higher number means better quality but worse performance. Keep it low on mobile devices.
`,
  },
  radiusFactor: {
    type: 'number',
    default: 1,
    min: 0,
    max: 5,
    description: `Blur radius factor. Higher number means more blur.`,
  },
})
class BlurImageElement extends pc.ScriptType {
  public camera?: Camera;
  public iterations = 8;
  public radiusFactor = 1;

  private blur?: Blur;

  public initialize(): void {
    const device = this.app.graphicsDevice;
    const camera = this.camera;

    this.on('attr:iterations', (value: number, oldValue: number) => {
      if (!this.camera) {
        return;
      }

      const blurController = BlurController.getInstance();

      blurController.release(this.camera, oldValue, this.radiusFactor);
      this.blur = blurController.retain(this.camera, value, this.radiusFactor);
    });

    this.on('attr:radiusFactor', (value: number, oldValue: number) => {
      if (!this.camera) {
        return;
      }

      const blurController = BlurController.getInstance();

      blurController.release(this.camera, this.iterations, oldValue);
      this.blur = blurController.retain(this.camera, this.iterations, value);
    });

    if (camera) {
      const blurController = BlurController.getInstance();

      this.blur = blurController.retain(
        camera,
        this.iterations,
        this.radiusFactor
      );
    }
  }

  public update = (() => {
    const rectTpm = new pc.Vec4();

    return () => {
      const element = this.entity.element;

      if (!this.blur) {
        return;
      }

      this.blur.render();

      const blurTexture = this.blur.getBlurTexture();

      const device = this.app.graphicsDevice;

      if (element) {
        const top = element.screenCorners[0].y;
        const bottom = element.screenCorners[2].y;
        const left = element.screenCorners[0].x;
        const right = element.screenCorners[1].x;

        rectTpm.set(
          left / device.width,
          top / device.height,
          (right - left) / device.width,
          (bottom - top) / device.height
        );
        element.rect = rectTpm;

        element.texture = blurTexture;
      }
    };
  })();
}
