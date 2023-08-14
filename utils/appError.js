///////////// class for all the rror handling and this class also extends the built in class 
///////////// properties of class Error;

class AppError extends Error {
    constructor (statusCode, message){
        super(message);                // taking values from the parent class i.e. :- Error class
        this.statusCode = statusCode
        //console.log(this.statusCode/100);
        if(Math.floor(this.statusCode/100) === 4){
            this.status = "fail"
        } else{
            this.status = "error"
        }
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }     // it is called each time a object of this class is created
}

module.exports = AppError;