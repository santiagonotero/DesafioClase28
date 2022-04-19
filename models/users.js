const mongoose = require('mongoose')
const bcrypt = require("bcrypt")

// Single responsability principle
// S.O.L.I.D

class Usuarios {

  constructor() {
    const schema = new mongoose.Schema({
      email: String,
      nombre: String,
      password: String
    })

    this.model = mongoose.model("users", schema)
  }

  // guardar usuario
  async save(obj) {
    obj.password = await bcrypt.hash(obj.password, 10)
    return await this.model.create(obj)
  }

  // existe por email

  existsByEmail(email) {
    return this.model.exists({ email })
  }

  async getById(id) {
    return await this.model.findById(id)
  }


  // obtener un usuario por email
  async getByEmail(email) {
    const user = await this.model.findOne({ email })

    return {
      id: user._id,
      nombre: user.nombre,
      email: user.email
    }
  }

  // checa que las passwords coincidan
  // regresa true o false
  async isPasswordValid(email, pwd) {
    const user = await this.model.findOne({ email })

    return await bcrypt.compare(pwd, user.password)
  }


  findOrCreateByEmail(email, user, done) {
    this.model.findOneAndUpdate({ email }, user, { upsert: true, new: true }, (err, createdUser) => {
      done(err, {
        id: createdUser._id.toString(),
        nombre: createdUser.nombre,
        email: createdUser.email
      })
    })
  }

}

module.exports = new Usuarios()