import { v4 as uuid } from "uuid";

export const fileNamer = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    //console.log({ file })

    // En caso de que esté vacio, salta una exception y ya no se ejecuta más. ( Muy importante enviar un false para decir que no hemos aceptado la petición )  
    if ( !file ) return callback( new Error( 'File is empty' ), false );

    const fileExtension = file.mimetype.split('/')[1];

    // En este caso utilizamos uuid, pero si utilizaramos otra forma y le pusieramos el mismo nombre que otro archivo ya guardado lo sobreescribe
    const fileName = `${ uuid() }.${ fileExtension }`;



    callback( null, fileName );

}