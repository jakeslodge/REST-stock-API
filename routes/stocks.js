var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.json({"error":true,"message":"Not Found"})
  //res.render('index', { title: 'stocks section' });
});


//middleware
const authorize = (req,res,next)=>{
  const authorization = req.headers.authorization
  console.log("autho:",authorization)
  let token = null;
  //retrive token
  if(authorization && authorization.split(" ").length == 2){
    token = authorization.split(" ")[1]
    console.log("Token: ",token)
  }else{
    console.log("Unauthorised user")
    //return;
  }
  //next()


  try{
    const secretKey = "Cab230!"
    const decoded = jwt.verify(token,secretKey)

    if (decoded.exp > Date.now()){
      console.log("Token has expired")
      res.status(403).json({"error":true, "message": "Authorization header expired"})
      return
    }

    //permit user to advance
    next()
  } catch (e){
    res.status(403).json({"error":true, "message": "Authorization header not found"})
    console.log("Token is not valid");
  }




}



//authenticated route
//                         , add authorize for middleware,

router.get("/authed/:symbol",authorize,function(req,res,next){
  console.log("auth route triggered");
  console.log(req.params);
  var symbol = req.params.symbol;

  //testing query params
  console.log(Object.keys(req.query));
  console.log(Object.keys(req.query).length);

 
  var from = req.query.from;
  var to = req.query.to;  
  console.log("SYMBOL IS -->"+symbol);
  //console.log(from);
  //console.log(to);

  if(symbol && Object.keys(req.query).length == 2)
  {
    if(from && to)
    {
      //they are from and to try parse them
      try{
        var parseFrom = new Date(from).toISOString();
        var parseTo = new Date(to).toISOString();

        //its all good lets check the symbol
        if(/^[A-Z]+$/.test(symbol) && symbol.length > 0 && symbol.length < 6)
        {
          //this symbol is valid lets search for dates
          req.db.from("stocks").select("*").where('symbol',symbol).where('timestamp','>=',from).where('timestamp','<=',to)
          .then((rows)=>{

            if(rows.length != 0)
            {
              res.status(200).json(rows)
            }
            else{
              res.status(404).json({
                "error": true,
                "message": "Not Found entries available for query symbol for supplied date range"
              })
            }
          })
    
          
        }
        else{
          //send invalid message
          res.json({"error": true,"message": "Stock symbol incorrect format - must be 1-5 capital letters"});
        }

      }
      catch (err){
        res.status(400).json({
          "error": true,
          "message": "Bad Request - Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
        })
      }
    }
    else
    {
      res.status(400).json({
        "error": true,
        "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
      })
    }
  }
  else if(symbol && Object.keys(req.query).length != 0)
  {
    res.status(400).json({
      "error": true,
      "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
    })
  }
  else if(symbol)
  {
    if(/^[A-Z]+$/.test(symbol) && symbol.length > 0 && symbol.length < 6)
    {
      //this symbol is valid lets search for the single
      req.db.from("stocks").select("*").where('symbol',symbol)
      .then((rows)=>{

        if(rows.length != 0)
        {
          res.status(200).json({"data":rows})
        }else{ //no results for that symbol
          res.status(404).json({
            "error": true,
            "message": "No entry for symbol in stocks database"
          });
        }

        
      })

    }
    else{
      //send invalid message
      res.json({"error": true,"message": "Stock symbol incorrect format - must be 1-5 capital letters"});
    }

  }
  else
  {
    res.json({error:"last one"})
  }

  

})



//lets do the handle for stock/symbols
router.get("/symbols",function(req,res, next) {
  let validQuery = true;
  console.log(req.query);

  for(const key in req.query){
    if(key != "industry")
    {
      validQuery = false;
    }
  }

  let industry = req.query.industry;
  console.log(industry);
    if(typeof industry === 'undefined' && validQuery)
    {
      
      req.db.from("stocks").distinct("name", "symbol","industry")
      .then((rows) => {
      res.status(200).json(rows)
      })
      .catch((err) => {
      console.log(err);
      res.status(400).json({"Error" : true, "Message" : "Error in MySQL query"})
      })

    }
    else if(validQuery)
    {
      industry = "%"+industry+"%";
      req.db.from("stocks").distinct("name", "symbol","industry").whereRaw("industry LIKE ?",[industry])
      .then((rows) => {

        if(rows.length==0)
        {
          res.status(404).json({
            "error": true,
            "message": "Industry sector Not Found"
          })
        }
        else{
          res.json(rows)
        }

        //console.log(rows.length);
      
      })
      .catch((err) => {
      console.log(err);
      res.json({"Error" : true, "Message" : "Error in MySQL query"})
    })
    }
    else
    {
      res.status(400).json({"error":true,"message":"Invalid query parameter: only 'industry' is permitted"});
    }

  });

router.get("/:symbol",function(req,res,next){
  let x = req.params.symbol;
  console.log(x);
  console.log(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6);

  if(Object.keys(req.query).length != 0 && x!= 'authed')
  {
    res.status(400).json({
      "error": true,
      "message": "Date parameters only available on authenticated route /stocks/authed",
    });
    return
  }
  else if(Object.keys(req.query).length != 0 && x== 'authed')
  {
    res.status(400).json({"error":true,"message":"Stock symbol incorrect format - must be 1-5 capital letters"});
    return
  }

  if(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6){
    req.db.from("stocks").select("*").where("symbol","=",req.params.symbol).limit(1)
      .then((rows)=> {
        
        if(rows.length==0)
        {
          res.status(404).json({
            "error": true,
            "message": "No entry for symbol in stocks database"
          })
        }
        else
        {
          res.status(200).json(rows[0])
        }

        
      })

  }
  else{
    res.status(400).json({"error":true,"message":"Stock symbol incorrect format - must be 1-5 capital letters"});
  }

  

});

router.get(function(req,res){res.status(404).json({error:true,message:"not found"})});


module.exports = router;
