var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    res.json({"error":true,"message":"Not Found"})
  //res.render('index', { title: 'stocks section' });
});



//lets do the handle for stock/symbols
router.get("/symbols", async function(req,res, next) {

  let industry = req.query.industry;
  console.log(industry);

    if(typeof industry === 'undefined')
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
    else
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

  });

module.exports = router;
