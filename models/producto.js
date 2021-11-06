const mongoose = require('mongoose'); //importar mongodb

const productoSchema = mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    descripcion:{
        type:String,
        required:true
    },
    richDescripcion:{
        type:String,
        default:''
    },
    imagen:{
        type:String,
        default:''
    },
    images:[{ //en el caso de este campo es el que hara referencia a las imagenes del producto por lo que se organizara a manera de array
        type:String
    }],
    marca:{
        type:String
    },
    precio:{
        type:Number,
        default:0

    },
    categoria:{
        type: mongoose.Schema.Types.ObjectId, //campo para conectar por id con la tabla categoria
        ref:'Categoria', //referencia del esquema de la db
        required:true
    },
    cantidadenStock:{
        type: Number,
        required: true,
        //se puede explicar que tanto de ese stock habra definiendo el min y max.
        min:0,
        max:255
    },
    rating:{
        type:Number,
        default:0
    },
    numReviews:{
        type:Number,
        default:0
    },
    destacado:{
        type:Boolean,
        default:false
    },
    fechaCreacion:{
        type:Date,
        default:Date.now
    }
})

productoSchema.virtual('id').get(function (){//metodo para volver el id un campo virtual
    return this._id.toHexString();
})

productoSchema.set('toJSON',{ //verificacion para convertir el id en un campo virtual en los archivos JSON
    virtuals: true
}),

exports.Producto = mongoose.model('Producto',productoSchema);