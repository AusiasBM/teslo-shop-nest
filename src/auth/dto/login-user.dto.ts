import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";



export class LoginUserDto {

    @IsString() // IsEmail() ya lleva incorporado el IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches( // Esto es una Expresión regular para que la contraseña tenga varias cosas necesarias
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;


}