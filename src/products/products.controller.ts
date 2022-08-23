import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from '../auth/entities/user.entity';
import { Product } from './entities/product.entity';

@ApiTags('Products') // Esto es para que aparezca en la documentación de swagger
@Controller('products')
//@Auth() // Si definimos este decorador aquí le estamos diciendo que se aplica a cualquiera de estas rutas
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: Product })
  @ApiResponse({ status: 400, description: 'Bad Request.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll( @Query() paginationDto: PaginationDto ) {
    console.log(paginationDto);
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    console.log(term)
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe ) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update( id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
