var express = require('express');
var router = express.Router();

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
  next()
}

//authenticated route
//                         , add authorize for middleware,

router.get("/authed/:symbol",function(req,res,next){
  console.log("auth route triggered");
  console.log(req.params);
  var symbol = req.params.symbol;

  //testing query params
  console.log(Object.keys(req.query));
  console.log(Object.keys(req.query).length);

 
  var from = req.query.from;
  var to = req.query.to;  
  console.log(symbol);
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
              res.json({"results":rows})
            }
            else{
              res.json({
                "error": true,
                "message": "No entries available for query symbol for supplied date range"
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
        res.json({
          "error": true,
          "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
        })
      }
    }
    else
    {
      res.json({
        "error": true,
        "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
      })
    }
  }
  else if(symbol && Object.keys(req.query).length != 0)
  {
    res.json({
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
          res.json({"results":rows})
        }else{ //no results for that symbol
          res.json({
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
router.get("/symbols", async function(req,res, next) {
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
      res.json({"Error" : false, "Message" : "Success", "Symbols" : rows})
      })
      .catch((err) => {
      console.log(err);
      res.json({"Error" : true, "Message" : "Error in MySQL query"})
      })

    }
    else if(validQuery)
    {
      industry = "%"+industry+"%";
      req.db.from("stocks").distinct("name", "symbol","industry").whereRaw("industry LIKE ?",[industry])
      .then((rows) => {

        if(rows.length==0)
        {
          res.json({
            "error": true,
            "message": "Industry sector not found"
          })
        }
        else{
          res.json({"Error" : false, "Message" : "Success", "Symbols" : rows})
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
      res.json({"error":true,"message":"Invalid query parameter: only 'industry' is permitted"});
    }

  });

router.get("/:symbol",function(req,res,next){
  let x = req.params.symbol;
  console.log(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6);

  if(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6){
    req.db.from("stocks").select("*").where("symbol","=",req.params.symbol).limit(1)
      .then((rows)=> {
        
        if(rows.length==0)
        {
          res.json({
            "error": true,
            "message": "No entry for symbol in stocks database"
          })
        }
        else
        {
          res.json({"data":rows})
        }

        
      })

  }
  else{
    res.json({"error":true,"message":"Stock symbol incorrect format - must be 1-5 capital letters"});
  }

  

});


module.exports = router;
