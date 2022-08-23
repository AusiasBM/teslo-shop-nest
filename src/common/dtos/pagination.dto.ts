import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";



export class PaginationDto{

    @ApiProperty({
        default: 10, 
        description: 'Cantidad de elementos por página',
    })
    @IsOptional()
    @IsPositive()
    @Type( () => Number ) // es lo mismo que el enableImplicitConversions: true
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'Cantidad de elementos a saltar',
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number ) // es lo mismo que el enableImplicitConversions: true
    offset?: number;



}