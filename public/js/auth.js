const miFormulario = document.querySelector('form');

const url = 'http://localhost:8080/api/auth/';

//Autenticacion manual
miFormulario.addEventListener('submit', ev =>{
    ev.preventDefault();

    const formData = {};

    for (let elem of miFormulario.elements){

        if (elem.name.length > 0) {
            formData[elem.name] = elem.value;
        }
    }

    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {'Content-Type':'application/json'}
    })
    .then(response => response.json())
    .then(({msg, token}) =>{
        if(msg){
            return console.error(msg);
        }

        localStorage.setItem('token', token);
        window.location = 'chat.html';
    })
    .catch(console.warn);
});

//Autenticacion via Google Auth
function handleCredentialResponse(response) {

    const body = {id_token: response.credential}

    fetch(url + 'google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })
        .then(resp=>resp.json())
        .then(({token}) => {
            localStorage.setItem('token', token);
            window.location = 'chat.html';
        })
        .catch(console.warn)
}

const button = document.getElementById('g_id_signout');
button.onclick = async() => {

    console.log(google.accounts.id)
    google.accounts.id.disableAutoSelect()

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        console.log('Sesion cerrada');
        localStorage.clear()
        location.reload()
    });
}