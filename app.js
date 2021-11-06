const express = require('express');
const app = express();
require('dotenv/config'); //importar dotenv
const morgan = require('morgan');//importar middleware
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); //importar mongodb
const cors = require('cors'); //importar cors
const authJwt = require('./helpers/jwt');





app.use(cors());
app.options('*',cors())


// middleware
app.use(bodyParser.json());// para vizualizar los archivos de la api
app.use(morgan('tiny'));// middleware para visualizacion de peticiones de cliente
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
//errorhandler para autenticar usuario
app.use((err, req, res, next)=>{
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({message:"el usuario no esta autorizado"})
    }
})


//rutas
const api = process.env.API_URL; //se anexara el nombre de la variable para los procesos,db que este en el archivo .env
const productosRouter = require('./routes/productos');//constante para rutas de productos
const categoriasRouter = require('./routes/categorias');//constante para rutas de categorias
const ordenesRouter = require('./routes/ordenes');//constante para rutas de ordenes
const usuariosRouter = require('./routes/usuarios');//constante para rutas de usuarios

app.use(`${api}/categorias`,categoriasRouter)//ruta de categorias
app.use(`${api}/productos`, productosRouter)// ruta de productos
app.use(`${api}/usuarios`, usuariosRouter)// ruta de usuarios
app.use(`${api}/ordenes`, ordenesRouter)// ruta de ordenes




mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName: 'e-shopDB'
})
.then(()=>{
    console.log('Conexion de base de datos lista')
})
.catch((err)=>{
    console.log(err);
})


app.listen(3869, () =>{
    //console.log(api); //mostrar conectividad con la env desde consola
    console.log('El servidor esta corriendo http://localhost:3869')
});