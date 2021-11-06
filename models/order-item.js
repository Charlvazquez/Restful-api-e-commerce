const mongoose = require('mongoose'); //importar mongodb

const ordenItemSchema = mongoose.Schema({
    cantidad:{
        type: Number,
        required: true
    },
    producto:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Producto',
    }
})

exports.OrdenItem = mongoose.model('OrdenItem',ordenItemSchema);