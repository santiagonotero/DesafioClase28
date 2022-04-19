const http = require('http')
const server = http.createServer()

const randoms=(cant=100000000)=>{

    let listaNum = {}

    console.log('cant: ' + cant)

    for(let i=0;i<cant; i++){

        let numRandom = Math.random()*1000
        numRandom = numRandom.toFixed(0)

        listaNum[numRandom] = (listaNum[numRandom] || 0 ) +1


        // listaNum[indiceLista] = Math.random()*1000
        // listaNum[indiceLista] = listaNum[indiceLista].toFixed(0)
        // indiceLista++
    } 
    return listaNum
}

   process.on('message', (msg)=>{
       if (msg.message === 'START'){
            const listado = randoms(msg.cant)
            process.send(listado)
       }
   }) 

   process.send('terminado')
  
