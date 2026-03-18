export interface SingleFBO {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

export interface DoubleFBO {
  read: SingleFBO;
  write: SingleFBO;
  width: number;
  height: number;
}

export function createSingleFBO(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): SingleFBO {
  const texture = gl.createTexture();
  if (!texture) throw new Error('Failed to create texture');
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error('Failed to create framebuffer');
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer not complete: 0x${status.toString(16)}`);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  return { fbo, texture, width, height };
}

export function createDoubleFBO(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
): DoubleFBO {
  const read = createSingleFBO(gl, width, height, internalFormat, format, type, filter);
  const write = createSingleFBO(gl, width, height, internalFormat, format, type, filter);
  return { read, write, width, height };
}

export function swapFBO(fbo: DoubleFBO): void {
  const temp = fbo.read;
  fbo.read = fbo.write;
  fbo.write = temp;
}

export function deleteSingleFBO(gl: WebGL2RenderingContext, fbo: SingleFBO): void {
  gl.deleteFramebuffer(fbo.fbo);
  gl.deleteTexture(fbo.texture);
}

export function deleteDoubleFBO(gl: WebGL2RenderingContext, fbo: DoubleFBO): void {
  deleteSingleFBO(gl, fbo.read);
  deleteSingleFBO(gl, fbo.write);
}

export function getSupportedFloatFormat(
  gl: WebGL2RenderingContext,
): { internalFormat: number; type: number } | null {
  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) return null;
  return { internalFormat: gl.RGBA16F, type: gl.HALF_FLOAT };
}
