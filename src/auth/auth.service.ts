import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}



  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto; 

      const user = this.userRepository.create( {
        ...userData,
        password: bcrypt.hashSync( password, 10 ) // Esto nos permite que aunque sea las misma contraseña nos va a dar resultados diferentes.
      } );

      await this.userRepository.save( user );

      delete user.password; // Esto lo hacemos para no devolver el password en la respuesta, no lo estamos borrando de la BBDD

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
      
    } catch (error) {
      this.handleDBErrors( error );
    }


  }

  async login( loginUserDto: LoginUserDto ){

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true } // Aquí le estoy diciendo los campos que quiero recibir
    });

    if ( !user )
      throw new UnauthorizedException( 'Credentials ara not valid (email)' )
    
    if( !bcrypt.compareSync( password, user.password ) ) // Estoy comparando si las contraseña es la misma
      throw new UnauthorizedException( 'Credentials ara not valid (password)' )

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  async checkAuthStatus( user: User ){
    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
    
  }

  private getJwtToken( payload: JwtPayload ){

      const token = this.jwtService.sign( payload );

      return token;

  }
  
  // El never sirve para decir que jamas va a regresar un valor, de esta forma si ponemos return nos da error
  private handleDBErrors( error: any ): never {
    if( error.code === '23505' )
      throw new BadRequestException( error.detail );

    console.log( error )

    throw new InternalServerErrorException( 'Please check server logs' );

  }

}
