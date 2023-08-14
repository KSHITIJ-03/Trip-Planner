const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({path: "./../../config.env"});   // config.env 
const fs = require("fs");

const password = process.env.DATABASE_PASSWORD;
const DB = process.env.DATABASE.replace("<PASSWORD>", password);

mongoose.connect(DB)
.then((con)=>{
    //console.log(con.connections);
    console.log("Connection with database successfull");
});

const Tour = require("./../../models/tourModel");

const tours = JSON.parse(fs.readFileSync(__dirname + "/tours-simple.json"));

const importData = async () =>{
    try{
        await Tour.create(tours);
        console.log("data successfully imported");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        console.log("data successfully deleted");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === "--import"){
    importData();
}
if(process.argv[2] === "--delete"){
    deleteData();
}

console.log(process.argv);