const express = require("express");
const app = express();
const morgan = require("morgan");

const errorController = require("./controllers/errorController")
const AppError = require(__dirname + "/utils/appError.js")
const tourRouter = require(__dirname + "/routes/tourRoutes")
const userRouter = require(__dirname + "/routes/userRoutes")
app.use(express.json());

if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

app.use(express.static(__dirname + "/public")) // middleware to show static files on browser
                                               // since files like index.html are not viewed from
                                               // routes therefore these are posted by static
                                               // middleware (app.use(express.static(file_path)));

// app.use((req, res, next)=>{
//     console.log(new Date().toISOString());
//     console.log(req);
//     next();
// })

// const validID = (req, res, next) =>{
//     if(req.params.id*1 > tours.length){
//         return res.status(404).json({
//             status : "fail",
//             message : "invalid id"
//         })
//     }
//     next();
// }



app.use("/api/v1/tours", tourRouter)   // making sub applications
app.use("/api/v1/users", userRouter);  // making sub applications

// if no routes are found then :-

app.all("*", (req, res, next)=>{          // all for all the api requests
    // res.status(404).json({
    //     status : "fail",
    //     message : req.originalUrl + " route is not found on this server"
    // })
    // next();

    // const err = new Error(req.originalUrl + " route is not found on this server")
    // err.status = "fail";
    // err.statusCode = 400
    //next(err);    // this is the only time when something is passed in next() and exprss
                  // automatically recognizes it as an error and to be passed to the error middleware
                  // no matter how many middlewares are in between this middleware and global error 
                  // handling middleware

    next(new AppError(404, req.originalUrl + " route is not found on this server"))
})

/////////////// global error handling middleware
/////////////// this middleware automatically recognize itself as a error handling middleware
/////////////// beacuse of its err argument
// app.use((err, req, res, next)=>{
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || "fail"

//     res.status(err.statusCode).json({
//         status : err.status,
//         message : err.message
//     })
//     next()
// })

app.use(errorController)          // these all are middlewares

module.exports = app;