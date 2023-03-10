import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { createServer } from 'http';
import { Server } from 'socket.io';

import usuarios from '../routes/usuarios.js';
import auth from '../routes/auth.js';
import productos from '../routes/productos.js';
import categorias from '../routes/categorias.js';
import buscar  from '../routes/buscar.js';
import uploads from '../routes/uploads.js';
import dbConnection from '../database/config.js';
import { socketController } from '../sockets/controller.js';

class Servidor{

    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.server = createServer(this.app);
        this.io = new Server(this.server);

        this.paths = {
            auth: '/api/auth',
            buscar: '/api/buscar',
            categorias: '/api/categorias',
            productos: '/api/productos',
            usuarios: '/api/usuarios',
            uploads: '/api/uploads',
        }

        //Conectar a base de datos
        this.conectarDB()

        //Middlewares: funciones que anaden otras funcionalidades al webserver
        this.middlewares();

        //Rutas de la aplicacion
        this.routes();

        //Sockets
        this.sockets();
    }

    async conectarDB(){
        await dbConnection()
    }

    middlewares(){
        //CORS
        this.app.use( cors() );

        //Lectura y parseo del body
        this.app.use(express.json());

        //Directorio publico
        this.app.use(express.static('public'));

        // Fileupload - Carga de archivos
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true,
        }));
    }

    routes(){
        this.app.use(this.paths.auth, auth);
        this.app.use(this.paths.buscar, buscar);
        this.app.use(this.paths.categorias, categorias);
        this.app.use(this.paths.productos, productos);
        this.app.use(this.paths.usuarios, usuarios);
        this.app.use(this.paths.uploads, uploads);
    }

    sockets(){
        this.io.on('connection', (socket) => socketController(socket, this.io));
    }

    listen(){
        this.server.listen(this.port, ()=>{
            console.log('Servidor corriendo en el puerto ', this.port);
        });

        this.app.use((err,req,res,next)=>{
            if(!err)return next();
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Peticion no valida',
                    err: 'BAD_REQUEST'
                }
            });
        });
    }
}



export default Servidor;