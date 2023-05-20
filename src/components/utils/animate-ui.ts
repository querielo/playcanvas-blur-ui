import { createScript } from '../../utils/createScript';
import { BlurImageElement } from '../blur-image';

const vec3Tmp = new pc.Vec3();

@createScript({
  blurTexture: {
    type: 'entity',
  },
})
class AnimateUI extends pc.ScriptType {
  public blurTexture?: pc.Entity;

  public update() {
    const time = performance.now() / 1000;

    this.entity.setLocalPosition(
      vec3Tmp.set(100 * Math.sin(time), 100 * Math.cos(time), 0)
    );

    const blurImage = this.blurTexture?.script?.get(
      'blurImageElement'
    ) as BlurImageElement;

    if (blurImage) {
      blurImage.radiusFactor = (10 * (1 + Math.sin(time / 2))) / 2 - 1;
    }
  }
}
