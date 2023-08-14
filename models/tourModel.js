const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const slug = require("slugify");
const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "a tour must have name"],
        unique : true,
        maxLength : [40, "a tour name can have max length of 40"],
        minLength : [5, "a tour name must have minimum length of 10"] 
    },
    slug : String,
    duration : {
        type : Number,
        required : [true, "a tour must have a duration"]
    },
    maxGroupSize : {
        type : Number,
        required : [true, "a tour must have a group size"]
    },
    difficulty : {
        type: String,
        required : [true, "a tour must have a difficulty"],

        //  custom validator made by me

        // validate : {
        //     validator : function(value) {
        //         return value === "difficult" || value === "easy" || value === "medium";
        //     } ,
        //     message : "{value is not a validd key}"
        // }

        enum : {
            values :["easy", "diffcult", "medium"],
            message :"difficulty can be easy or medium or difficult"
        }
    },
    ratingsAverage : {
        type : Number,
        default : 4.5,
        min : [1, "rating in between 1 and 5"],
        max : [5, "rating in between 1 and 5"]
    },
    ratingsQuantity : {
        type : Number,
        defult : 0
    },
    price : {
        type : Number,
        required : [true, "A tour must have price"]
    },
    priceDiscount : {
        type : Number,
        validate : {
            validator : function(value) {
                return value < price;
            },
            message : "priceDiscount should be less then price"
        }
    },
    summary : {
        type : String,
        trim : true,
        required : [true, "a tour must have a discription"]
    },
    decription : {
        type : String,
        trim : true
    },
    imageCover : {
        type : String,
        required : [true, "a tour must have a cpver image"]
    },
    images : [String],
    createdAt : {
        type : Date,
        default : Date.now()
    },
    startDates : [Date],
    secretTour : {
        type : Boolean,
        default : false
    }
    
}, {                             ///////////// virtual fields like all the conversions and all
                                 ///////////// small fields these are not stored in databases and 
                                 ///////////// therefore these are initiated only when the server is 
                                 ///////////// called.
                                 ///////////// virtual properties do not follow the properties of 
                                 ///////////// mongoose like model.find() etc
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});

tourSchema.virtual("durationWeeks").get(function(){
    return this.duration/7                           /// "this" denotes the document passed in tourSchema and this.duration states
                                                     /// that the duration part of that object
})     

////////////// pre middleware before saving a document ////////////////////

tourSchema.pre("save", function(next){
    this.slug = slugify(this.name, {lower : true});
    next();
})

////////////// post middleware after saving a document ////////////////////

tourSchema.post("save", function(doc, next){
    console.log(doc);
    next();
})

///////////////////////////////// post querry middleware ///////////////////

tourSchema.pre(/^find/, function(next) {                               //will work for find but not for findOne therefore   /^find/
    this.find({secretTour : {$ne : true}})
    next()
})

//////////////////////////////// pre aggregate pipeline ////////////////////

tourSchema.pre("aggregate", function(next){

    this.pipeline().unshift({$match : {secretTour : {$ne : true}}});

    console.log(this.pipeline());
    next();
})

const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;