const mongoose = require('mongoose'); //importar mongodb

const categoriaSchema = mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    icono:{ //fuente o fond 
        type:String
    },
    color:{// campo para especificar los colores, mas que nada del lado del front-end
        type:String
    }
})

exports.Categoria = mongoose.model('Categoria',categoriaSchema);