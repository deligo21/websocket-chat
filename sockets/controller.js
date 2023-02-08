import { Socket } from "socket.io"
import { comprobarJWT } from "../helpers/generar-jwt.js";
import ChatMensajes from "../models/chat-mensajes.js";

const chatMensajes = new ChatMensajes();

const socketController = async(socket = new Socket(), io) => {
    const usuario =  await comprobarJWT(socket.handshake.headers['x-token']);

    if (!usuario) {
        return socket.disconnect();
    }

    //Agregar el usuario conectado
    chatMensajes.conectarUsuario( usuario );
    io.emit('usuarios-activos', chatMensajes.usuariosArr);
    socket.emit('recibir-mensajes', chatMensajes.ultimos10);

    //Agregarlo a una sala especial
    socket.join( usuario.id ); //Global, socket.id, usuario.id


    //Limpiar cuando alguien se desconecta
    socket.on('disconnect', () =>{
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    });

    socket.on('enviar-mensaje', ({ uid, mensaje }) =>{

        if (uid) {
            //Mensaje privado
            socket.to(uid).emit('mensaje-privado', {de: usuario.nombre, mensaje});
        } else{
            //Mensaje global
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }

    });
}

export {
    socketController,
}