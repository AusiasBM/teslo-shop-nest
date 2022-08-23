import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductImage } from "./product-image.entity";
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' }) // Esto pone un nombre específico a la tabla en la BBDD
export class Product {

    @ApiProperty({ 
        example: '231489cf-6511-4534-8704-71dd5c30098c', 
        description: 'The unique identifier of the product UUID.',
        uniqueItems: true 
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ 
        example: 'Kids Cybertruck Tee', 
        description: 'The title of the product.',
        uniqueItems: true 
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({ 
        example: 25.50, 
        description: 'The price of the product.',
        default: 0
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({ 
        example: 'Product 1 description', 
        description: 'The description of the product.',
        default: null 
    })
    @Column({
        type: 'text',
        nullable: true // Puede aceptar null
    })
    description: string;

    @ApiProperty({ 
        example: 'kids_cybertruck_tee', 
        description: 'The slug of the product.',
        uniqueItems: true 
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({ 
        example: 4, 
        description: 'The stock of the product.',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({ 
        example: ['s', 'm', 'l'], 
        description: 'The sizes of the product.',
        default: [] 
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Women', 
        description: 'Gender of product'
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany( // En este paso estamos haciendo una relación de 1 a muchos, ya que un producto puede tener muchas imágenes.
        () => ProductImage,
        (productImage) => productImage.product,
        { 
            cascade: true,
            eager: true // Cada vez que utilicemos cualquier método find* va ha cargar todas las relaciones
        }
    )
    images?: ProductImage[];

    @ApiProperty()
    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true } // Le decimos que carge automáticamente esta relación
    )
    user: User

    @BeforeInsert()
    checkSlugInsert(){
        if( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}
