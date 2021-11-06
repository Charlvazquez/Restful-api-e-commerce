const mongoose = require('mongoose'); //importar mongodb

const ordenSchema = mongoose.Schema({
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'OrdenItem',
        required:true
    }],
    direccionEnvio1:{
        type:String,
        required:true
    },
    direccionEnvio2:{
        type:String,
    },
    ciudad:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        required:true
    },
    pais:{
        type:String,
        required:true
    },
    telefono:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:'Pendiente'
    },
    precioTotal:{
        type:Number
    },
    usuario:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Usuario'
    },
    fechaOrdenada:{
        type:Date,
        default: Date.now
    }

})

ordenSchema.virtual('id').get(function (){//metodo para volver el id un campo virtual
    return this._id.toHexString();
})

ordenSchema.set('toJSON',{ //verificacion para convertir el id en un campo virtual en los archivos JSON
    virtuals: true
}),

exports.Orden = mongoose.model('Orden',ordenSchema);