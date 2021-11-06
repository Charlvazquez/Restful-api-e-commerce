const mongoose = require('mongoose'); //importar mongodb

const usuarioSchema = mongoose.Schema({
    nombre:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type: String,
        required: true
    },
    telefono:{
        type:String,
        required:true
    },
    esAdmin:{
        type:Boolean,
        default: false
    },
    calle:{
        type:String,
        default:''
    },
    apartamento:{
        type:String,
        default:''
    },
    zip:{
        type:String,
        default:''
    },
    ciudad:{
        type:String,
        default:''
    },
    pais:{
        type:String,
        default:''
    }
})

usuarioSchema.virtual('id').get(function (){//metodo para volver el id un campo virtual
    return this._id.toHexString();
})

usuarioSchema.set('toJSON',{ //verificacion para convertir el id en un campo virtual en los archivos JSON
    virtuals: true
}),

exports.Usuario = mongoose.model('Usuario',usuarioSchema);
exports.usuarioSchema = usuarioSchema;