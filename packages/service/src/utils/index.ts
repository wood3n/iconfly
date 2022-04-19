import { optimize } from 'svgo';
import glob from 'glob';
import { extname, resolve, join, basename } from 'path';
import { readFileSync, ensureDirSync, writeFileSync } from 'fs-extra';
import SVGSpriter from 'svg-sprite';

interface OptimizationOption {
  cleanColor?: boolean;
}

/**
 * 优化 svg
 */
export function optimizeSvg(
  svg: Express.Multer.File,
  { cleanColor }: OptimizationOption
): string {
  const result = optimize(svg.buffer.toString(), {
    // 更好优化 svg
    multipass: true,
    plugins: [
      'preset-default',
      {
        // 选择是否移除 svg 元素的颜色属性：https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color
        name: 'removeAttrs',
        params: {
          attrs: cleanColor
            ? ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color']
            : '',
        },
      },
    ],
  });

  // @ts-expect-error result is OptimizedSvg
  return result.data;
}

/**
 * 组合指定文件夹内部的 svg 文件
 * @param dir
 * @returns
 */
export async function getSvgSprite(dir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const spriter = new SVGSpriter({});

    glob('**/*.svg', { cwd: dir }, (_, files) => {
      files.forEach((filename) => {
        console.log(filename);
        const filePath = join(dir, filename);
        spriter.add(
          filePath,
          basename(filename),
          readFileSync(filePath, 'utf8')
        );
      });

      spriter.compile((error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.css.sprite.contents);
        }
      });
    });
  });
}
