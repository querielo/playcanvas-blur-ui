import { ElementTouchEvent } from 'playcanvas';
import { Blur, Camera } from '../utils/blur';
import { createScript } from '../utils/createScript';

@createScript({
  camera: {
    type: 'entity',
  },
})
class BlurImage extends pc.ScriptType {
  public camera?: pc.Entity;

  private blur?: Blur;

  public initialize(): void {
    const device = this.app.graphicsDevice;
    const camera = this.camera;

    if (camera?.camera) {
      this.blur = new Blur(device, camera as Camera);

      // const postUiLayer = this.app.scene.layers.getLayerByName('PostUI');

      // if (postUiLayer) {
      //   postUiLayer.onPreRender = () => {
      //     this.blur?.render();
      //   };
      // }
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
