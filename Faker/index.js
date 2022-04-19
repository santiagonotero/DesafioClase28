const {faker} = require('@faker-js/faker');

class Faker{
    constructor(){

    }

    crearLista(){
     
        let listaProductos=[]

        for(let i=0; i<5; i++){

            let producto = new Object()
           producto.nombre = faker.name.firstName()
           producto.precio = faker.commerce.price()
           producto.foto = faker.image.imageUrl()

           listaProductos.push(producto)
        }
        return listaProductos
    }
}

module.exports = new Faker