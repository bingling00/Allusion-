import { default as init, decode } from 'wasm/exr-decoder/pkg/exr_decoder';
import { Loader } from './util';

class ExrLoader implements Loader {
  async init(): Promise<void> {
    await init(new URL('wasm/exr-decoder/pkg/exr_decoder_bg.wasm', import.meta.url));
  }

  decode(buffer: Buffer): ImageData {
    return decode(buffer);
  }
}

export default ExrLoader;
