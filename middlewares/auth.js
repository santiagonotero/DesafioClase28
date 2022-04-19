module.exports = {

   auth:(req, res, next) => {

    //(req, res, next) => {
    if(!req.isAuthenticated()) {
      return res.redirect("/login")
  }

  next()
  }
}
