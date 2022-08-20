import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from './product.entity';


@Entity({ name: 'products_images' }) // Esto pone un nombre específico a la tabla en la BBDD
export class ProductImage{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: String;

    @ManyToOne( // En esta paso estamos haciendo una relación de muchos a uno, ya que muchas imagenes tienen un producto.
        () => Product,
        ( product ) => product.images,
        { onDelete: 'CASCADE' } // Le estamos diciendo que cuando borremos un producto se borren las imágenes en cascada.
    )
    product: Product

}