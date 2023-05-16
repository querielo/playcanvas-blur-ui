import { RefCounter } from './ref-counter';
import { Camera } from './types';

const FRAGMENT_SHADER = `
uniform sampler2D uTexture;

uniform vec2 uPixelSize;
uniform vec2 uDirection;

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

    gl_FragColor = color;
}
`;

export class Blur extends RefCounter {
  private readonly device: pc.GraphicsDevice;

  private readonly cameraEntity: Camera;

  private readonly firstBlurShader: pc.Shader;
  private readonly loopBlurShader: pc.Shader;

  private blurRenderTargets: pc.RenderTarget[] = [];

  private width = 0;
  private height = 0;
  private iterations = 10;
  private factor = 3;

  constructor(device: pc.GraphicsDevice, camera: Camera) {
    super();

    this.device = device;

    this.cameraEntity = camera;

    this.cameraEntity.camera.requestSceneColorMap(true);

    this.firstBlurShader = pc.createShaderFromCode(
      device,
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
      device,
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
  }

  public destroy() {
    this.cameraEntity.camera?.requestSceneColorMap(false);

    this.firstBlurShader.destroy();
    this.loopBlurShader.destroy();

    this.destroyRenderTargets();
  }

  public setIterations(iterations: number) {
    this.iterations = iterations;
  }

  public setRadiusFactor(factor: number) {
    this.factor = factor;

    // if factor = 0, then the collor buffer has to be full black and transparent
    if (factor === 0) {
      const texture =
        this.blurRenderTargets[(Math.floor(this.iterations) + 1) % 2]
          .colorBuffer;

      const pixels = texture.lock();
      pixels.fill(0);
      texture.unlock();
    }
  }

  public getBlurTexture() {
    return this.blurRenderTargets[(Math.floor(this.iterations) + 1) % 2]
      .colorBuffer;
  }

  public render() {
    this.resize();

    const device = this.device;
    const scope = device.scope;
    scope.resolve('uH').setValue(2 / this.width);

    scope.resolve('uPixelSize').setValue([1 / this.width, 1 / this.height]);
    const directionHandler = scope.resolve('uDirection');
    const textureHandler = scope.resolve('uTexture');
    const iterations = Math.floor(this.iterations);

    for (let i = 0; i < this.iterations; i++) {
      let radius = (this.iterations - i) * this.factor;

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
  }

  private destroyRenderTargets() {
    for (const renderTarget of this.blurRenderTargets) {
      renderTarget.destroyTextureBuffers();
      renderTarget.destroy();
    }
  }
}
