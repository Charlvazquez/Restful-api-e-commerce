const expressJwt = require('express-jwt');

function authJwt(){ //funcion para autenticacion de JWT en el acceso a la API
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({//metodo con el que se le da acceso a la parte de registro y login de la API
        path:[
            //uso de regular expressions y rutas que pueden verse sin estar registrado
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/productos(.*)/ , methods: ['GET', 'OPTIONS']},//para especificar un campo sin registrar para ver los productos del sitio
            {url: /\/api\/v1\/categorias(.*)/ , methods: ['GET', 'OPTIONS']},
            `${api}/usuarios/login`,
            `${api}/usuarios/registro`
        ]
    })
}

async function isRevoked(req, payload, done){
    if(!payload.esAdmin){
        done(null, true)
    }
    done();
}
   

module.exports = authJwt;