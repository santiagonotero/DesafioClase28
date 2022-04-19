// >> Consigna:
// Sobre el proyecto del último desafío entregable, mover todas las claves y credenciales 
// utilizadas a un archivo .env, y cargarlo mediante la librería dotenv.
// La única configuración que no va a ser manejada con esta librería va a ser el puerto 
// de escucha del servidor. Éste deberá ser leído de los argumento pasados por línea de comando, 
// usando alguna librería (minimist o yargs). En el caso de no pasar este parámetro por línea de 
// comandos, conectar por defecto al puerto 8080.
// Observación: por el momento se puede dejar la elección de sesión y de persistencia explicitada 
// en el código mismo. Más adelante haremos también parametrizable esta configuración.


// >> Consigna:

// Agregar otra ruta '/api/randoms' que permita calcular un cantidad de números aleatorios en el 
// rango del 1 al 1000 especificada por parámetros de consulta (query).
// Por ej: /randoms?cant=20000.
// Si dicho parámetro no se ingresa, calcular 100.000.000 números.
// El dato devuelto al frontend será un objeto que contendrá como claves los números random 
// generados junto a la cantidad de veces que salió cada uno. Esta ruta no será bloqueante 
// (utilizar el método fork de child process). Comprobar el no bloqueo con una cantidad de 500.000.000 de randoms.

// Observación: utilizar routers y apis separadas para esta funcionalidad.




(async()=>{
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
const {engine} = require ("express-handlebars")
const path = require("path")
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const Filestore = require('session-file-store')(session)
const passport = require('passport')
const flash = require('express-flash')
const initializePassport = require('./Passport/local')
const prodMethod = require('./models/productos')
const msgMethod = require('./models/mensajes')
const { HOSTNAME, SCHEMA, DATABASE, USER, PASSWORD, OPTIONS } = require("./DBconfig/Mongo")
const homeRouter = require('./routes/routes')
const yargs = require('yargs/yargs') (process.argv.slice(2))
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
})

const args = yargs.default({ PORT: 8080}).argv

//const PORT = process.env.PORT || 8080

mongoose.connect(`${process.env.SCHEMA}://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOSTNAME}/${process.env.DATABASE}?${process.env.OPTIONS}`).then(()=>{
  console.log("Conectado con base de datos MongoDB")
})

let messagePool=[]
let productList=[]

initializePassport(passport)

app.use("/static/", express.static(path.join(__dirname, "public")))

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(flash())
app.use(cookieParser("Esto es un secreto"))
app.use(session({
  secret:"secret",
  resave: true,
  saveUninitialized:true,
  
  store:new MongoStore({
    mongoUrl: `${process.env.SCHEMA}://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOSTNAME}/${process.env.DATABASE}?${process.env.OPTIONS}`,
    expires: 60,
    createdAt: new Date(),
    autoRemove: 'native',
    autoRemoveInterval: 1,
    ttl: 60, 
    autoRemove: true,
    delete: true
  })
}))

app.use(passport.initialize())
app.use(passport.session())


app.set('view engine', 'hbs')
  
app.engine('hbs',engine({
  layoutsDir: path.join(__dirname,'/views'),
  extname: 'hbs',
  defaultLayout:''
}))

app.use('/', homeRouter)

// iniciamos la conexión del socket
io.on("connection", async function (socket) {   //Mensaje que indica una conexión. 
  console.log("Un cliente se ha conectado")

  messagePool = await msgMethod.cargarMensajes()
  productList = await prodMethod.cargarProductos()

  socket.emit("messages", messagePool)

  prodMethod.cargarProductos().then((listaProductos)=>{
    socket.emit('server:productList', listaProductos)
  })

  socket.on('new-message', async (data)=>{  // Mensaje que indica un nuevo mensaje de chat recibido
      msgMethod.appendMessage(data)  // Almacenar mensaje en la base de datos
      messagePool = await msgMethod.cargarMensajes()
      io.sockets.emit("messages", messagePool)
    })

  socket.on('new-product', (prodInfo)=>{ //Mensaje que indica un nuevo producto agregado al stock de productos
    prodInfo.precio = JSON.parse(prodInfo.precio)
    prodMethod.agregarProducto(prodInfo) // Almacenar nuevo producto en la base de datos
      
    //Desnormalización de datos de product
      
    prodMethod.cargarProductos().then((listaProductos)=>{

      productList = prodMethod.data
      console.log('main.js-> mensaje new-product: ' + listaProductos)
      
      io.sockets.emit('server:productList', listaProductos)
    })
  })    
    
})

server.listen(args.PORT, function () {
    console.log(`Servidor corriendo en http://localhost:${args.PORT}`)
  })

})()
