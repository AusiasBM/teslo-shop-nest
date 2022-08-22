import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { isUUID } from 'class-validator';
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService'); // Con esto conseguimos que los errores sean más legibles en el log
  
  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}
  
  
  async create(createProductDto: CreateProductDto, user: User) {
    
    try {

      // En este caso los 3 puntos se llama `operador rest` sirve para decirle 
      // que todas las propiedades que no sean las imágenes van a caer ahí. 
      // Queremos decir que la varaible ...productDetails va ha tener todos los atributos del producto menos las imágenes.
      const{ images = [], ...productDetails } = createProductDto;

      // Estamos creando un producto, pero a la vez estamos creando las imágenes de ese producto.
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) ), // utilizamos la función map para que recorra el array de imágenes que recibimos y cree las imágenes.
        user,
      }); // Esto solo crea la instancia del producto ( es síncrono )
      await this.productRepository.save( product );

      return { ...product, images }; // Aquí estamos modificando el json que devolvemos para que devuelve una lista de urls y no devuelva el id de la imagen, etc.

    } catch (error) {
      this.handleDBExceptions(error);
    }
    
  }

  async findAll( paginationDto: PaginationDto ) {
    
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{ // Aquí le podemos poner todas las relaciones que queramos
        images: true, // si ponemos la relación a true le estamos diciendo que llene la consulta con los datos de la relación
      }
    });

    // Estamos cogiendo el json, separamos la imagenes del producto y luego le decimos que solo queremos que muestre la url de las imágenes
    return products.map( ({ images, ...rest }) => ({
      ...rest,
      images: images.map( img => img.url )
    }) )

  }

  async findOne(term: string) {
    
    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');    
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if ( !product ) 
      throw new NotFoundException(`Product with id ${ term } not found`);

    return product;
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )
    }

  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;


    const product = await this.productRepository.preload({ id, ...toUpdate });

    if ( ! product ) throw new NotFoundException( `Product with id: ${ id } not found` );

    // Cuando utilizamos el queryRunner no estamos impactando directamente en la BBDD

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect(); // Nos conectamos a la BBDD
    await queryRunner.startTransaction(); // Iniciamos la transacción


    try {

      if ( images ){ // Si nos dan imágenes
        await queryRunner.manager.delete( ProductImage, { product: { id } } ) // Eliminamos las que tenemos de este producto
          product.images = images.map( image => this.productImageRepository.create({ url: image }) 
        )
      }

      product.user = user;

      await queryRunner.manager.save( product );
      //await this.productRepository.save( product );
      
      await queryRunner.commitTransaction(); // Impactamos en la BBDD si todo ha ido bién
      await queryRunner.release(); // Eliminamos el queryRunner.
      
      return this.findOnePlain( id ); 
      
    } catch (error) {

      await queryRunner.rollbackTransaction(); // En caso de que alguna transacción no se haya podido hacer tiramos los cambios atras.
      await queryRunner.release(); // Eliminamos el queryRunner.

      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne( id );

    await this.productRepository.remove( product );

  }

  // Con este método controlamos todos los errores centralizados
  private handleDBExceptions( error: any ){

    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  // Esto solo lo vamos a utilizar solo en desarrollo
  async deleteAllProducts(){

    const query = this.productRepository.createQueryBuilder( 'product' );

    try {
      
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

}
