const mongoose = require('mongoose')
const fs = require('fs/promises');
const path = require('path');

class Productos{

    constructor(){
        const schema = new mongoose.Schema({
                nombre: String,
                precio: Number,
                foto: String
        })

        this.model = mongoose.model('productos', schema)
    }

    async agregarProducto(obj){
        try{

            //normalizar producto

            const producto = await this.model.create(obj)
            return producto
        }
        catch(err){
           console.log(err)
        }
    }
    async cargarProductos(){
        try{ 
            const data = await this.model.find().lean()
            return data
        }
        catch(err){
            console.log(err)
        }
    }

}

module.exports = new Productos();