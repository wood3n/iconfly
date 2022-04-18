import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { extname, resolve } from 'path';
import { optimize } from 'svgo';
import { ResponseDto } from './response.dto';
import { AppService } from './app.service';

class FileUploadRes extends ResponseDto {
  url: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File): FileUploadRes {
    // 基于 svgo 优化 svg
    const result = optimize(file.buffer.toString(), {
      // optional but recommended field
      path: file.originalname,
      // all config fields are also available here
      multipass: true,
      plugins: [
        // set of built-in plugins enabled by default
        'preset-default',

        // enable built-in plugins by name
        'prefixIds',

        // or by expanded notation which allows to configure plugin
        {
          name: 'sortAttrs',
          params: {
            overrides: {
              // customize default plugin options
              inlineStyles: {
                onlyMatchedOnce: false,
              },

              // or disable plugins
              removeDoctype: true,
            },
          },
        },
      ],
    });

    const dirName = resolve(process.cwd(), 'icons');
    const filename = `${Date.now()}${extname(file.originalname)}`;
    ensureDirSync(dirName);
    writeFileSync(`${dirName}/${filename}`, result.data, 'utf8');

    // 保存 url 到数据库
    // const fileUrl = this.appService.saveUploadUrl();

    return {
      status: 200,
      url: `/icons/${filename}`,
    };
  }
}
