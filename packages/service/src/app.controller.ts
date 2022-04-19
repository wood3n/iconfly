import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { extname, resolve } from 'path';
import { optimizeSvg, getSvgSprite } from './utils';
import { ResponseDto } from './response.dto';
import { AppService } from './app.service';

class FileUploadRes extends ResponseDto {
  url: string;
}

class SvgContentRes extends ResponseDto {
  svg: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 文件夹名称
  iconPath = 'icons';

  @Get('svg')
  async getSvgSprite(): Promise<SvgContentRes> {
    const svg = await getSvgSprite(resolve(process.cwd(), this.iconPath));

    return {
      status: 200,
      svg,
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('cleanColor') cleanColor: boolean
  ): FileUploadRes {
    const dirName = resolve(process.cwd(), this.iconPath);
    const filename = `${Date.now()}${extname(file.originalname)}`;
    ensureDirSync(dirName);
    writeFileSync(
      `${dirName}/${filename}`,
      optimizeSvg(file, { cleanColor }),
      'utf8'
    );

    // 保存 url 到数据库
    // const fileUrl = this.appService.saveUploadUrl();

    return {
      status: 200,
      url: `/icons/${filename}`,
    };
  }
}
