import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // cuando ponemos este decorador estamos diciendole a nest que vamos a manejar nosotros la respuesta, por ende el return no nos funcionará
    @Param('imageName') imageName: string
  ){

    const path = this.filesService.getStaticProductImage( imageName );

    console.log(path)

    res.sendFile( path );

    // res.status(403).json({
    //   ok: false,
    //   path: path
    // })

  }

  @Post('product')
  @UseInterceptors( FileInterceptor( 'file', { // Esto nos hace falta para poder recibir la imagen por el form-data con el nombre de file
    fileFilter: fileFilter, // El fileFilter nos permite hacer las comprobaciones necesarias para saber si el file es lo que queremos, en caso de que no, el fileFilter no dejará pasar la imágen.
    // limits: { fileSize: 1000 } // Le podemos decir muchos límites de lo que queremos
    storage: diskStorage({
      destination: './static/products', // nos pide un directorio para guardarlos
      filename: fileNamer
    })
  }))
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File,
  ){

    if( !file ) {
      throw new BadRequestException( 'Make sure that the file is an image' );
    }

    console.log( file );

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;

    return { secureUrl };
  }

}

