const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({path: __dirname + "/config.env"});   // config.env 

const app = require("./app");

const password = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE.replace("<PASSWORD>", password);

mongoose.connect(DB)
.then((con)=>{
    //console.log(con.connections);
    console.log("Connection with database successfull");
});



const port = 3000 || process.env.PORT;
app.listen(port, ()=>{
    console.log("app is running on: " + port);
});

//console.log(process.env);