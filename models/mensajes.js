const knex = require('knex');
const mongoose = require('mongoose')
const fs = require('fs/promises');
const path = require('path');
const {schema, normalize} = require('normalizr')

class Mensajes{

    constructor(){
        const schema = new mongoose.Schema({
            author: {
                id: String, //'mail del usuario'
                nombre: String, //'nombre del usuario' 
                apellido: String, //'apellido del usuario' 
                edad: Number, //'edad del usuario' 
                alias: String, //'alias del usuario'
                avatar: String //'url avatar (foto, logo) del usuario'
            },
            text: String
        })

        this.model = mongoose.model ('mensajes', schema)
    }

    async cargarMensajes(){
        try{ 

            //proceso dde normalización
            const schemaAuthor = new schema.Entity('author',{},{idAttribute: 'id'}) //id contiene el email del autor 
            const schemaMensaje = new schema.Entity('mensajes',{
                author: schemaAuthor
            })

            const schemaData = new schema.Entity('data',{
                mensajes: [schemaMensaje]
            })

            const mensajesEnBD = await this.model.find({}).lean()
            
            const MsgNormalizados = normalize({
                id: 'mensajes',
                mensajes: mensajesEnBD.map((d)=>{
                    return {
                        author: d.author,
                        text: d.text,
                        id: d._id.toString()
                    }
                })
                
            }, schemaData)
            return MsgNormalizados

        }
        catch(err){
            console.log(err)
        }
    }

    async appendMessage(msg){
        try{ 
            const msgPool = await this.model.create(msg)
            return msgPool
        }
        catch(err){
            console.log(err)
        }
    }

}

module.exports = new Mensajes();