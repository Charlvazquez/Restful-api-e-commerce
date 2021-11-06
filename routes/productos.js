const express = require('express');
const { Categoria } = require('../models/categoria');
const router = express.Router();
const {Producto} = require('../models/producto');
const mongoose = require('mongoose');
const multer = require('multer');

//constante para definir el tipo de formato de nuestros archivos media
const FILE_TYPE_MAP ={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('tipo de imagen invalido');

        if(isValid){
            uploadError = null
        }
        cb(uploadError,'public/uploads')
    },
    filename: function(req, file, cb){
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${ Date.now()}.${extension}`)
    }
})

    const uploadOptions = multer({storage: storage})



router.get('/', async (req,res)=>{ //ruta donde se filtran los productos por el id de las categorias
    //arreglo por el que se basara el filtro para buscar los productos por categoria
    let filtro = {}
    if(req.query.categorias)
    {
        filtro = {categoria: req.query.categorias.split(',')} //al momento de agregar una categoria y querer buscar otra parte, se hara agregando la nueva antes de una "," 
    }
   
    //const Listaproductos = await Producto.find().select('nombre imagen descripcion'); //-_id es la forma de no esconder el campo del id en el front end
    const Listaproductos = await Producto.find(filtro).populate('categoria');// metodo para buscar productos por id mediante la constante filtro
    if(!Listaproductos){
        res.status(500).json({success:false})
    }
    res.send(Listaproductos)
});

router.post('/', uploadOptions.single('imagen'), async (req,res)=>{
    const categoria = await Categoria.findById(req.body.categoria);
    if(!categoria) return res.status(400).send('categoria invalida')
    
    const file = req.file;//constante para detectar archivo media
    if(!file) return res.status(400).send('No hay imagen en la peticion')//en caso no insertar una imagen para el producto, mandara el siguiente mensaje en el servidor
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let producto = new Producto({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        richDescripcion: req.body.richDescripcion,
        imagen: `${basePath}${fileName}`, // "http://localhost:3869/public/uploads/imagen-232323"
        marca: req.body.marca,
        precio: req.body.precio,
        categoria: req.body.categoria,
        cantidadenStock: req.body.cantidadenStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        destacado: req.body.destacado,
    })

    producto = await producto.save();//guardar datos 

    if(!producto)
    return res.status(500).send('¡el producto no puede ser creado!')

    res.send(producto);
})

router.get('/:id', async (req,res)=>{//ruta para mostrar productos por id
    //metodo para mostrar registros por id con populate se muestran la informacion mas detallada de la tabla
    const producto = await Producto.findById(req.params.id).populate('categoria'); //cuando la una base de datos requiera de otra puede verse los campos anexando.populate('campo que se mezcla con id')
    if(!producto){
        res.status(500).json({success:false})
    }
    res.send(producto)
})

router.put('/:id',uploadOptions.single('imagen'), async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Id de producto invalido')

    }// metodo para validacion de id
    const categoria = await Categoria.findById(req.body.categoria);
    if(!categoria) return res.status(400).send('categoria invalida')

    const producto = await Producto.findById(req.params.id);
    if(!producto) return res.status(400).send('categoria invalida')

    const file = req.file;//constante para detectar archivo media
    let imagepath;
    if(file){
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/upload`;
        imagepath = `${basePath}${fileName}`
    }else{
        imagepath = producto.imagen;
    }

    const productoActualizado = await Producto.findByIdAndUpdate(// metodo para actualizar
        req.params.id,
        {//objeto que donde se definiran los campos en la base de datos para actualizar
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            richDescripcion: req.body.richDescripcion,
            imagen: imagepath,
            marca: req.body.marca,
            precio: req.body.precio,
            categoria: req.body.categoria,
            cantidadenStock: req.body.cantidadenStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            destacado: req.body.destacado,  
        },
        {new: true}//al momento de hacer el edit de los datos en lugar de mostrarnos los datos viejos, se mostraran los nuevos
    )

    if(!productoActualizado)
    return res.status(500).send('¡el producto no se ha actualizado!')

    res.send(productoActualizado);
    
})

router.delete('/:id', (req,res)=>{//ruta para borrar productos
    
    Producto.findByIdAndRemove(req.params.id).then(producto=>{//metodo para eliminar la producto por id
        if(producto){
            return res.status(200).json({success:true, message:'el producto esta borrada'})//si se borro la categoria
        }else{
            return res.status(404).json({success:false, message:'producto no encontrada'})//si no se borro la categoria
        }
    }).catch(err=>{
        return res.status(500).json({success:false, error:err})// en caso de que haya un error en el servidor 
    })
})

router.get('/get/destacado/:count', async (req,res) =>{
    const count = req.params.count ? req.params.count: 0    
    const producto = await Producto.find({destacado: true}).limit(+count);
    
    if(!producto){
        res.status(500).json({success:false})
    }
    res.send(producto);
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Producto.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;