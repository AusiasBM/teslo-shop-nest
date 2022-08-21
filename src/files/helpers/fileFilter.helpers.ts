

export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {

    //console.log({ file })

    // En caso de que esté vacio, salta una exception y ya no se ejecuta más. ( Muy importante enviar un false para decir que no hemos aceptado la petición )  
    if ( !file ) return callback( new Error( 'File is empty' ), false );

    // El mimetype nos dice el tipo de extensión que es
    const fileExptension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    
    if( validExtensions.includes( fileExptension ) ){
        return callback( null, true )
    }

    callback( null, false );

}