const express = require('express');
const router = express.Router();
const {Categoria} = require('../models/categoria');

router.get('/', async (req,res)=>{//ruta para todas las categorias
    const Listcategorias = await Categoria.find(); //metodo para buscar todos los registros
    if(!Listcategorias){
        res.status(500).json({success:false})
    }
    res.status(200).send(Listcategorias)
});

router.get('/:id', async(req,res)=>{//ruta para buscar una sola categoria por id
    const categoria = await Categoria.findById(req.params.id);//busqueda de categoria por su id correspondiente
    if(!categoria){
        res.status(500).json({message:"La categoria con el id dado no fue encontrada"})//mensaje de error en caso de que la id no sea alguna existente

    }else{
        res.status(200).send(categoria); //mostrar la categoria
    }
})

router.post('/',async(req,res)=>{// ruta para almacenar una categoria
    let categoria = new Categoria({ //definir en un modelo en la db, que se almacenara en los campos de la tabla
        nombre: req.body.nombre,
        icono: req.body.icono,
        color: req.body.color
    })
    categoria = await categoria.save();//guardar datos 

    if(!categoria)
    return res.status(404).send('¡la cateogia no puede ser creada!')

    res.send(categoria);
})

router.put('/:id', async(req,res)=>{
    const categoria = await Categoria.findByIdAndUpdate(// metodo para actualizar
        req.params.id,
        {//objeto que donde se definiran los campos en la base de datos para actualizar
            nombre: req.body.nombre,
            icono: req.body.icono,
            color: req.body.color  
        },
        {new: true}//al momento de hacer el edit de los datos en lugar de mostrarnos los datos viejos, se mostraran los nuevos
    )

    if(!categoria)
    return res.status(404).send('¡la cateogia no se ha actualizado!')

    res.send(categoria);
    
})

router.delete('/:id', (req,res)=>{//ruta para borrar categorias
    //el nombre correspondiente al parametro de la ruta principal, debe ser igual al que vayas a colocar en el metodo
    Categoria.findByIdAndRemove(req.params.id).then(categoria=>{//metodo para eliminar la categoria por id
        if(categoria){
            return res.status(200).json({success:true, message:'la categoria esta borrada'})//si se borro la categoria
        }else{
            return res.status(404).json({success:false, message:'categoria no encontrada'})//si no se borro la categoria
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error:err})// en caso de que haya un error en el servidor 
    })
})





module.exports = router;