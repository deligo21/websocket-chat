const url = 'http://localhost:8080/api/auth/';

//Referencia al usuario autenticado
let usuario = null;
//Referencia al socket conectado
let socket = null;

//Referencias HTML
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const ulMensajesPriv = document.querySelector('#ulMensajesPriv');
const btnSalir = document.querySelector('#btnSalir');


//Validar el token del local storage
const validarJWT = async() =>{
    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch(url, {
        headers:{'x-token': token}
    });

    const {usuario:userDB, token: tokenDB} = await resp.json();
    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();
}

//Validar el JWT con el backend
const conectarSocket = async() =>{
    
    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token'),
        },
    });

    socket.on('connect', ()=>{
        console.log('Sockets online');
    });

    socket.on('disconnect', ()=>{
        console.log('Sockets offline');
    });

    socket.on('recibir-mensajes', dibujarMensajes);

    socket.on('usuarios-activos', dibujarUsuarios);

    socket.on('mensaje-privado',dibujarMensajesPriv);
}

const dibujarUsuarios = ( usuarios = []) =>{
    let usersHtml = '';
    usuarios.forEach(({ nombre, uid }) =>{
        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success">${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    });

    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = ( mensajes = []) =>{
    let mensajesHtml = '';
    mensajes.forEach(({ nombre, mensaje }) =>{
        mensajesHtml += `
            <li>
                <p>
                    <span class="text-primary">${nombre}: </span>
                    <span class="fs-6 text-muted">${mensaje}</span>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = mensajesHtml;
}

const dibujarMensajesPriv = ( { de, mensaje } = {}) =>{
    let mensajesPrivHtml = '';

    mensajesPrivHtml += `
            <li>
                <p>
                    <span class="text-primary">${de }: </span>
                    <span class="fs-6 text-muted">${mensaje}</span>
                </p>
            </li>
        `;

    ulMensajesPriv.innerHTML = mensajesPrivHtml;
}


txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if (keyCode !== 13) {
        return;
    }

    if (mensaje.length === 0) {
        return;
    }

    socket.emit('enviar-mensaje', {mensaje, uid});

    txtMensaje.value = '';
});

const main = async() => {
    await validarJWT();
}

main();
