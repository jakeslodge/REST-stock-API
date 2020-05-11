var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req,res,next)
{
  
  var email = req.body.email;
  var pass = req.body.password;
  if (!email || !password)
  {
    res.status(400).json({
      error:true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }
  //see if the email is in use
  const queryUsers = req.db.from("users").select("*").where("email","=",email);
  queryUsers
    .then((users) => {
      if(users.length > 0) {
        console.log("User already exsits");
        return;
      }
  

  
});


module.exports = router;
