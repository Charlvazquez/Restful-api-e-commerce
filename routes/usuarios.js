const express = require('express');
const { Usuario } = require('../models/usuario');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.get('/', async (req,res)=>{
    //metodo para buscar todos los registros
    const Listausuarios = await Usuario.find().select('nombre email'); //.select('agregar solo los campos a mostrar en el front end') 
    if(!Listausuarios){
        res.status(500).json({success:false})
    }
    res.send(Listausuarios)
});

router.get('/:id', async(req,res)=>{//ruta para buscar un solo usuario por id
    //busqueda de usuario por su id correspondiente
    const usuario = await Usuario.findById(req.params.id).select('-passwordHash');//usar "- + el campo que quieras ocultar no lo mostrara en la parte del front end"
    if(!usuario){
        res.status(500).json({message:"El usuario con el id dado no fue encontrado"})//mensaje de error en caso de que la id no sea alguna existente

    }
     res.status(200).send(usuario); //mostrar el usuario
})

router.post('/',async(req,res)=>{// ruta para almacenar usuarios
    let usuario = new Usuario({ //definir en un modelo en la db, que se almacenara en los campos de la tabla
        nombre: req.body.nombre,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),//para generar una contraseña mas secreta/encriptada
        telefono: req.body.telefono,
        esAdmin: req.body.esAdmin,
        calle: req.body.calle,
        apartamento: req.body.apartamento,
        zip: req.body.zip,
        ciudad: req.body.ciudad,
        pais: req.body.pais
    })
    usuario = await usuario.save();//guardar datos 

    if(!usuario)
    return res.status(404).send('¡el usuario no puede ser creado!')

    res.send(usuario);
})

router.put('/:id',async(req,res)=>{
    const usuarioExiste = await Usuario.findById(req.params.id);
    let newPassword
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password, 10)
    }else{
        newPassword = usuarioExiste.passwordHash;
    }

    const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        {
            nombre: req.body.nombre,
            email: req.body.email,
            passwordHash: newPassword,
            telefono: req.body.telefono,
            esAdmin: req.body.esAdmin,
            calle: req.body.calle,
            apartamento: req.body.apartamento,
            zip: req.body.zip,
            ciudad: req.body.ciudad,
            pais: req.body.pais

    },
    {new: true}
    )

    if(!usuario)
    return res.status(400).send('el usuario no puede ser actualizado')

    res.send(usuario);
})

router.post('/login', async (req,res)=>{
    const usuario = await Usuario.findOne({email: req.body.email})//findOne es para buscar un tipo columna en la base de datos
    const secret = process.env.secret;
    if(!usuario){
        return res.status(400).send('Usuario no encontrado');
    }
    if(usuario && bcrypt.compareSync(req.body.password, usuario.passwordHash)){ //metodo para comparar si la contraseña del usuario es la misma
        //
        const token = jwt.sign( //al momento de hacer el token y este sea exitoso se transmitira cualquier dato para la parte del front end
            {
                usuarioId: usuario.id,
                esAdmin:usuario.esAdmin
            },
            secret,
            {expiresIn: '1d'}
        )

        res.status(200).send({usuario: usuario.email, token:token})
    }else{
        res.status(400).send('contraseña invalida');

    }
})

router.post('/registro',async(req,res)=>{
        let usuario = new Usuario({ //definir en un modelo en la db, que se almacenara en los campos de la tabla
            nombre: req.body.nombre,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),//para generar una contraseña mas secreta/encriptada
            telefono: req.body.telefono,
            esAdmin: req.body.esAdmin,
            calle: req.body.calle,
            apartamento: req.body.apartamento,
            zip: req.body.zip,
            ciudad: req.body.ciudad,
            pais: req.body.pais
        })
        usuario = await usuario.save();//guardar datos 

        if(!usuario)
        return res.status(404).send('¡el usuario no puede ser creado!')

        res.send(usuario); 
    })

    router.delete('/:id', (req,res)=>{//ruta para borrar usuarios
        //el nombre correspondiente al parametro de la ruta principal, debe ser igual al que vayas a colocar en el metodo
        Usuario.findByIdAndRemove(req.params.id).then(usuario =>{//metodo para eliminar la categoria por id
            if(usuario){
                return res.status(200).json({success:true, message:'usuario borrado exitosamente'})//si se borro el usuario
            }else{
                return res.status(404).json({success:false, message:'usuario no encontrado'})//si no se borro el usuario
            }
        }).catch(err=>{
            return res.status(400).json({success:false, error:err})// en caso de que haya un error en el servidor 
        })
    })    


module.exports = router;