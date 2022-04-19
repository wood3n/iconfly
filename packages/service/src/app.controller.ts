import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { readFileSync, ensureDirSync, writeFileSync } from 'fs-extra';
import { extname, resolve, join, basename } from 'path';
import { optimize } from 'svgo';
import SVGSpriter from 'svg-sprite';
import glob from 'glob';
import { ResponseDto } from './response.dto';
import { AppService } from './app.service';

class FileUploadRes extends ResponseDto {
  url: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('svg')
  getSvgSprite() {
    const spriter = new SVGSpriter({
      dest: './icons',
      mode: {
        css: {
          example: false,
        },
      },
    });

    glob(
      '**/*.svg',
      {
        cwd: process.cwd(),
      },
      (err, files) => {
        files.forEach((filename) => {
          const filePath = join(process.cwd(), filename);
          spriter.add(
            filePath,
            basename(filename),
            readFileSync(filePath, 'utf8')
          );
        });

        spriter.compile((error, result, data) => {
          if (error) {
            console.log(error);
            return;
          }

          console.log(result);
          try {
            for (const type in result.css) {
              writeFileSync(
                join(process.cwd(), 'icons', basename(result.css[type].path)),
                result.css[type].contents
              );
            }
          } catch (err) {
            console.log(err);
          }
        });
      }
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('cleanColor') cleanColor: boolean
  ): FileUploadRes {
    // 基于 svgo 优化 svg
    const result = optimize(file.buffer.toString(), {
      // optional but recommended field
      path: file.originalname,
      // all config fields are also available here
      multipass: true,
      plugins: [
        'preset-default',
        {
          // 选择是否移除 svg 元素的颜色属性：https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/color
          name: 'removeAttrs',
          params: {
            attrs: cleanColor
              ? [
                  'fill',
                  'stroke',
                  'stop-color',
                  'flood-color',
                  'lighting-color',
                ]
              : '',
          },
        },
      ],
    });

    const dirName = resolve(process.cwd(), 'icons');
    const filename = `${Date.now()}${extname(file.originalname)}`;
    ensureDirSync(dirName);
    // @ts-expect-error result is OptimizedSvg
    writeFileSync(`${dirName}/${filename}`, result.data, 'utf8');

    // 保存 url 到数据库
    // const fileUrl = this.appService.saveUploadUrl();

    return {
      status: 200,
      url: `/icons/${filename}`,
    };
  }
}
