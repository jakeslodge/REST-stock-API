var express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req,res,next)
{
  
  var email = req.body.email;
  var password = req.body.password;
  console.log("register|"+email+"|"+password);
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
        res.status(409).json({  "error": true,
        "message": "User already exists!"})
        return;
      }
      
      //insert user into db
      const saltRounds = 10
      const hash = bcrypt.hashSync(password,saltRounds)
      console.log(email);
      return req.db.from("users").insert({email,hash})
      .then(() => {
        res.status(201).json({  "success": true,
        "message": "User Created"})
      })
  })



  
});


router.post('/login', function(req,res,next)
{
  var email = req.body.email;
  var password = req.body.password;
  var validEmail = false;

  console.log(email);
  console.log(password);


  //verify body
  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
      })
  return
  }

  //see if the user exsits
  const queryUsers = req.db.from("users").select("*").where("email","=",email);
  queryUsers
    .then((users)=> {
      if(users.length == 0){
        res.status(401).json({"error": true,"message": "Email not linked to an account"})
        return;
      }

      //compare password hashes
      validEmail = true;
      const user = users[0]
      return bcrypt.compare(password,user.hash)
      //res.json({"beep:":users})
    })
    .then((match)=>{

      if(validEmail){
        if(!match){
          res.status(401).json({"error":true,"message":"Incorrect password"});
          return;
        }
        else{
          //its good lets generate the token
          const secretKey = "Cab230!";
          const expires_in = 60 * 60 * 24;
          const exp = Math.floor(Date.now()/1000) + expires_in;
          const token = jwt.sign({email,exp},secretKey);
          res.status(200).json({token_type:"Bearer",token,expires_in})
        }
      }
    
      
    })



});



module.exports = router;
