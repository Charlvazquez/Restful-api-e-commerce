const express = require('express');
const router = express.Router();
const {Orden} = require('../models/orden');
const { OrdenItem } = require('../models/order-item');

router.get('/', async (req,res)=>{//ruta para visualizar todas las ordenes
    //metodo para buscar todos los registros
    const Listaordenes = await Orden.find().populate('usuario', 'nombre').sort('fechaOrdenada'); 
    //al usar populate en caso de tener campo relacionados con otras tablas se mostraran todos los datos de dicho campo, para especificar uno en especifico, se anexa el campo a mostrar
    if(!Listaordenes){
        res.status(500).json({success:false})
    }
    res.send(Listaordenes)
});

router.get('/:id', async (req,res)=>{//ruta para visualizar orden por su id
    //metodo para buscar todos los registros
    const orden = await Orden.findById(req.params.id)
    .populate('usuario', 'nombre')
    .populate({
        path:'orderItems',populate:{
            path:'producto',populate: 'categoria'
        }}); //si se quiere detallar en un campo que tambien esta conectado a otro, se convierte en un objeto y se agrega otro populate para buscar la informacion del campo relacionado
    //al usar populate en caso de tener campo relacionados con otras tablas se mostraran todos los datos de dicho campo, para especificar uno en especifico, se anexa el campo a mostrar
    if(!orden){
        res.status(500).json({success:false})
    }
    res.send(orden)
});

router.post('/', async(req,res)=>{// ruta para almacenar la orden hecha
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrdenItem = new OrdenItem({
            cantidad: orderItem.cantidad,
            producto: orderItem.producto
        })

        newOrdenItem = await newOrdenItem.save();

        return newOrdenItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    const precioTotales = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId)=>{ //arreglo con el que se mide el precio total de la orden del producto
        const orderItem = await OrdenItem.findById(orderItemsId).populate('producto' ,'precio');
        const precioTotal = orderItem.producto.precio * orderItem.cantidad;
        return precioTotal
    }))

    const precioTotal = precioTotales.reduce((a,b)=> a+b, 0);

    console.log(precioTotales)



    let orden = new Orden({ //definir en un modelo en la db, que se almacenara en los campos de la tabla
        orderItems: orderItemsIdsResolved,
        direccionEnvio1: req.body.direccionEnvio1,
        direccionEnvio2: req.body.direccionEnvio2,
        ciudad: req.body.ciudad,
        zip: req.body.zip,
        pais: req.body.pais,
        telefono: req.body.telefono,
        status: req.body.status,
        precioTotal: precioTotal,
        usuario: req.body.usuario

    })
    orden = await orden.save();//guardar datos 

    if(!orden)
    return res.status(404).send('¡la orden no puede ser creada!')

    res.send(orden);
})

router.put('/:id', async(req,res)=>{// ruta para actualizar status de la orden
    const orden = await Orden.findByIdAndUpdate(// metodo para actualizar
        req.params.id,
        {//objeto que donde se definiran los campos en la base de datos para actualizar
            status: req.body.status
        },
        {new: true}//al momento de hacer el edit de los datos en lugar de mostrarnos los datos viejos, se mostraran los nuevos
    )

    if(!orden)
    return res.status(404).send('¡la orden no se ha actualizado!')

    res.send(orden);
    
})

router.delete('/:id', (req,res)=>{//ruta para borrar ordenes
    //el nombre correspondiente al parametro de la ruta principal, debe ser igual al que vayas a colocar en el metodo
    Orden.findByIdAndRemove(req.params.id).then(async orden=>{//metodo para eliminar la orden por id
        if(orden){
            await orden.orderItems.map(async orderItem =>{
                await OrdenItem.findByIdAndRemove(orderItem)//metodo para eliminar producto pedido
            })
            return res.status(200).json({success:true, message:'orden borrada'})//si se borro la orden
        }else{
            return res.status(404).json({success:false, message:'orden no encontrada'})//si no se borro la orden
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error:err})// en caso de que haya un error en el servidor 
    })
})

router.get('/get/total-de-ventas', async(req, res)=>{//ruta para mostrar el total de ventas
    const ventaTotal = await Orden.aggregate([//metodo para llevar acabo la suma de todo que se ha ordenado mediante el campo precioTotal de cada orden
        { $group: {_id:null, totalventas:{$sum: '$precioTotal'}}}
    ])

    if(!ventaTotal){
        return res.status(400).send('El orden de ventas no puede ser generado')
    }

    res.send({totalventas: ventaTotal.pop().totalventas})//en base a que se tiene que usar un id para la db, se ocupa el metodo pop().la constante que hace la operacion del metodo
})

router.get('/get/ordenes-usuarios/:userid', async (req,res)=>{//ruta para ordenes de usuarios
    //metodo para buscar todos los registros
    const Listaordenesusuario = await Orden.find({usuario:req.params.userid}).populate({
        path:'orderItems',populate:{
            path:'producto',populate: 'categoria'}
        }).sort('fechaOrdenada'); 
    //al usar populate en caso de tener campo relacionados con otras tablas se mostraran todos los datos de dicho campo, para especificar uno en especifico, se anexa el campo a mostrar
    if(!Listaordenesusuario){
        res.status(500).json({success:false})
    }
    res.send(Listaordenesusuario)
});


module.exports = router;