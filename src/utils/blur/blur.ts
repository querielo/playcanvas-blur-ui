import { RefCountable } from './ref-counter';
import { Camera } from './types';

const FRAGMENT_SHADER = `
uniform sampler2D uTexture;

uniform vec2 uPixelSize;
uniform vec2 uDirection;

uniform float uAlpha;

varying vec2 vUv0;

void main() {
  vec4 sum = vec4( .0 );

  vec2 uv = vUv0;
  vec2 direction = uDirection * uPixelSize;

  vec4 color = vec4(.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(uTexture, uv) * .2270270270;
  color += texture2D(uTexture, uv + off1) * .3162162162;
  color += texture2D(uTexture, uv - off1) * .3162162162;
  color += texture2D(uTexture, uv + off2) * .0702702703;
  color += texture2D(uTexture, uv - off2) * .0702702703;

  gl_FragColor = vec4(color.xyz, uAlpha);
}
`;

export const RESIZE_EVENT = 'resize';

export class Blur extends RefCountable(pc.EventHandler) {
  private readonly app: pc.AppBase;
  private readonly device: pc.GraphicsDevice;

  private readonly cameraEntity: Camera;

  private readonly firstBlurShader: pc.Shader;
  private readonly loopBlurShader: pc.Shader;

  private readonly blankTexture: pc.Texture;

  private blurRenderTargets: pc.RenderTarget[] = [];

  private width = 0;
  private height = 0;
  private iterations = 10;
  private factor = 3;

  constructor(camera: Camera) {
    super();

    const cameraComponent = camera.camera;

    this.app = cameraComponent.system.app;

    this.device = this.app.graphicsDevice;

    this.cameraEntity = camera;

    cameraComponent.requestSceneColorMap(true);

    this.blankTexture = new pc.Texture(this.device, {
      name: 'Blank Texture',
      format: pc.PIXELFORMAT_RGBA8,
      minFilter: pc.FILTER_LINEAR,
      magFilter: pc.FILTER_LINEAR,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
      width: 1,
      height: 1,
      mipmaps: false,
      levels: [new Uint8Array([0, 0, 0, 0])],
    });

    this.firstBlurShader = pc.createShaderFromCode(
      this.device,
      pc.PostEffect.quadVertexShader,
      FRAGMENT_SHADER.split('uTexture')
        .join('uSceneColorMap')
        .replace('= vUv0', '= vec2(vUv0.x, 1. - vUv0.y)'),
      'FirstBlurShader',
      {
        aPosition: pc.SEMANTIC_POSITION,
      }
    );

    this.loopBlurShader = pc.createShaderFromCode(
      this.device,
      pc.PostEffect.quadVertexShader,
      FRAGMENT_SHADER,
      'LoopBlurShader',
      {
        aPosition: pc.SEMANTIC_POSITION,
      }
    );

    for (let i = 0; i < 2; i++) {
      this.blurRenderTargets[i] = new pc.RenderTarget({
        // @ts-ignore
        graphicsDevice: this.device,
        name: 'Blur: Horizontal',
        depth: false,
      });
    }

    this.app.on('update', this.render, this);
  }

  public destroy() {
    this.cameraEntity.camera?.requestSceneColorMap(false);

    this.firstBlurShader.destroy();
    this.loopBlurShader.destroy();

    this.destroyRenderTargets();

    this.app.off('update', this.render, this);
  }

  public setIterations(iterations: number) {
    this.iterations = iterations;
  }

  public setRadiusFactor(factor: number) {
    this.factor = factor;
  }

  public getBlurTexture() {
    return this.factor > 0
      ? this.blurRenderTargets[(Math.floor(this.iterations) + 1) % 2]
          .colorBuffer
      : this.blankTexture;
  }

  public render() {
    if (this.isFree() && this.factor > 0) {
      return;
    }

    this.resize();

    const device = this.device;
    const scope = device.scope;
    scope.resolve('uH').setValue(2 / this.width);

    scope.resolve('uPixelSize').setValue([1 / this.width, 1 / this.height]);
    const directionHandler = scope.resolve('uDirection');
    const textureHandler = scope.resolve('uTexture');
    const alphaHandler = scope.resolve('uAlpha');
    const iterations = Math.floor(this.iterations);

    for (let i = 0; i < iterations; i++) {
      let radius = (iterations - i) * this.factor;

      if (i === 0) {
        directionHandler.setValue([radius, 0]);
        pc.drawQuadWithShader(
          device,
          this.blurRenderTargets[0],
          this.firstBlurShader
        );
      } else {
        const direction = i % 2 === 0 ? [radius, 0] : [0, radius];
        const texture = this.blurRenderTargets[(i + 1) % 2].colorBuffer;

        directionHandler.setValue(direction);
        textureHandler.setValue(texture);

        // TODO: make something smarter, don't use magic variable 2
        alphaHandler.setValue(Math.min(this.factor * this.factor * 2, 1));

        pc.drawQuadWithShader(
          device,
          this.blurRenderTargets[i % 2],
          this.loopBlurShader
        );
      }
    }
  }

  private resize() {
    const width = this.device.width;
    const height = this.device.height;

    if (width === this.width && height === this.height) {
      return;
    }

    // Render targets
    this.width = width;
    this.height = height;

    this.destroyRenderTargets();

    for (let i = 0; i < 2; i++) {
      const blurTexture = new pc.Texture(this.device, {
        name: 'Blur Texture: Horizontal',
        format: pc.PIXELFORMAT_RGBA8,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
        width: this.width,
        height: this.height,
        mipmaps: false,
      });
      this.blurRenderTargets[i] = new pc.RenderTarget({
        name: 'Blur: Horizontal',
        colorBuffer: blurTexture,
        depth: false,
      });
    }

    this.fire(RESIZE_EVENT);
  }

  private destroyRenderTargets() {
    for (const renderTarget of this.blurRenderTargets) {
      renderTarget.destroyTextureBuffers();
      renderTarget.destroy();
    }
  }
}
