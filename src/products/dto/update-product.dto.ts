//import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; // Esto es para que swagger sepa que es un PartialType
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

