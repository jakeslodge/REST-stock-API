if(symbol && from && to) //all three paramaters
  {


    //lets see if the given dates are good
    try{
      var parseFrom = new Date(from).toISOString();
      console.log(parseFrom);
    }
    catch (err){
      console.log("invalid from data");
    }


    if(/^[A-Z]+$/.test(symbol) && symbol.length > 0 && symbol.length < 6)
    {
      //this symbol is valid lets search for dates
      req.db.from("stocks").select("*").where('symbol',symbol).where('timestamp','>=',from).where('timestamp','<=',to)
      .then((rows)=>{
        res.json({"results":rows})
      })

      
    }
    else{
      //send invalid message
      res.json({"error": true,"message": "Stock symbol incorrect format - must be 1-5 capital letters"});
    }
  }
  else
  {
    if(/^[A-Z]+$/.test(symbol) && symbol.length > 0 && symbol.length < 6)
    {
      //this symbol is valid lets search for the single
      res.json({"searching":symbol})
    }
    else{
      //send invalid message
      res.json({"error": true,"message": "Stock symbol incorrect format - must be 1-5 capital letters"});
    }
    
  }