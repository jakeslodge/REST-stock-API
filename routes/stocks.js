var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    res.json({"error":true,"message":"Not Found"})
  //res.render('index', { title: 'stocks section' });
});



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
      
      req.db.from("stocksa").select("name", "symbol","industry")
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
      req.db.from("stocksa").select("name", "symbol","industry").whereRaw("industry LIKE ?",[industry])
      .then((rows) => {
      res.json({"Error" : false, "Message" : "Success", "Symbols" : rows})
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
  //symbol test
  let x = req.params.symbol;
  console.log(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6);

  if(/^[A-Z]+$/.test(x) && x.length > 0 && x.length < 6){
    res.json({"symbol":req.params.symbol});

    //the regex is valid

    //check database for symbol

    //if nothing then no entry

    //otherwise spit it back

  }
  else{
    res.json({"error":true,"message":"Stock symbol incorrect format - must be 1-5 capital letters"});
  }

  

});

module.exports = router;
