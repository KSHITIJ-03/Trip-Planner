const Tour = require("./../models/tourModel");

// exports.validID = (req, res, next)=>{
//     const id = req.params.id*1;
//     if(id > tours.length){
//         return res.status(404).json({
//             status : "fail",
//             message : "invalid id"
//         })
//     }
//     next();
// }

// exports.validID = (id) =>{
//     if(id > tours.length){
//                 return false;
//     }
//     return true;
// }

// exports.checkBody = (req, res, next) =>{
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status : "fail",
//             message : "missing name or price"
//         })
//     }
//     next();
// }

// exports.checkID = (req, res, next, val) =>{         // example of param middleware
//     if(val > tours.length){
//         return res.status(404).json({
//             status : "fail",
//             message : "invalid id"
//         })
//     }
//     next();
// }

exports.getTop5Cheap = async (req, res)=>{      ////// all this can also be done from middleware ///////
                                                ////// since we know how to call all the tours
                                                ////// we only have to generate some queries before getAllTours
    try{
        let query = Tour.find();
        query = query.sort("price -ratingsAverage");
        query = query.select("-__v");
        query = query.limit(5);
        const tour = await query;
        res.status(200).json({
            status : "success",
            results : tour.length,
            data : {
                tour
            }
        })
    }catch(err){
        res.status(400).json({
            status: "fail",
            message : err
        })
    }
}
////////////////////////////////////  monthly plan ////////////////////////////  very important pipeline ///////////////////////

exports.getMonthlyPlan = async (req, res) =>{
    try{

        const year = req.params.year;


        const plan = await Tour.aggregate([
            {
                $unwind : "$startDates"  // it unwinds the startDates array and create a document
                                         // for each element of array 
            },
            {
                $match : {
                    startDates : {
                        $gte : new Date(year + "-01-01"),
                        $lte : new Date(year + "-12-31")
                    }
                }
            },
            {
                $group : {
                    _id : {
                        $month : "$startDates"
                    },
                    numTourStarts : {
                        $sum : 1
                    },
                    tours : {$push : "$name"}
                }
            },
            {
                $addFields : { month : "$_id" }
            },
            {
                $project : { _id : 0}
            },
            {
                $sort : { numTourStarts : -1}
            }
            // {
            //     $limit : 12
            // }
        ]);
        res.status(200).json({
            status : "success",
            //results : numTourStats,
            data : {
                plan
            }
        })
    } catch(err) {
        res.status(400).json({
            status : "fail",
            message : err
        })
    }
}

/////////////// getTourStats ////////////////////////// piplining //////////////////////////////////

exports.getTourStats = async (req, res)=>{
    try{
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage : {$gte : 4.5}}
            },
            {
                $group : {
                    _id : "$difficulty",
                    numTours : {$sum : 1},
                    avgRating : {$avg : "$ratingsAverage"},
                    avgPrice : {$avg : "$price"},
                    minPrice : {$min : "$price"},
                    maxPrice : {$max : "$price"}
                }
            },
            {
                $sort : {avgRating : 1}
            },
            // {
            //     $match : {
            //         _id : {
            //             $ne : "easy"
            //         }
            //     }
            // }
        ]);
    
        res.status(200).json({
            status : "success",
            data : {
                stats
            }
        });
    } catch(err) {
        res.status(400).json({
            status : "fail",
            message : err
        })
    }
    
}

/////////////// gettop5cheap through another method ie middleware ///////////////////////

exports.aliasTop5Tour = (req, res, next) =>{
    req.query.sort = "price -ratingsAverage";
    req.query.limit = 5;
    req.query.fields = "name price duration ratingsAverage";
    next();
}


exports.getAllTours = async (req, res) =>{
    try{
        // we have to remove some queries like paging and sort from the url //
        const filter = { ...req.query }; //creating a copy of query, first destructure the querry object then make it
                                         // object again as filter
                                         // in this way we don't loose the orinal queries
        const excludedFields = ["page", "limit", "fields", "sort"];
        excludedFields.forEach(el=> delete filter[el]);
        console.log(req.query, filter);

        // advanced filtering

        let updated_filter = JSON.stringify(filter);

        updated_filter = updated_filter.replace(/\b(gt|gte|lt|lte)\b/g, match=> "$" + match);

        let query = Tour.find(JSON.parse(updated_filter)); // let is used to because further changes has to be made

        // sorting
        if(req.query.sort){
            const sort = req.query.sort.split(",").join(" "); // sort(rating duration) // first sort by rating then duration
            query = query.sort(sort);
        } else {
            query = query.sort("-createdAt");
        }

        // field limiting
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            //console.log(fields);
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 100; // default value 100
        const skip = (page-1) * limit;
        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(page > numTours) throw new Error("this page do not exist");
        }

        const tours = await query;
    
        res.status(200).json({
            status : "success",
            results : tours.length,
            data : {
                tours
            }
        });
    }catch(err){
        res.status(400).json({
            status : "fail",
            message : err
        })
    }

    
}

exports.getTour = async (req, res)=>{
    try{
        const tour = await Tour.findById(req.params.id);
        // const tour = await Tour.find({_id : req.params.id});
        res.status(200).json({
            status : "success",
            data : {
                tour
            }
        })
    }catch(err){
        res.status(400).json({
            status : "fail",
            message : err
        })
    }
}

exports.updateTour = async (req, res) =>{
    console.log(req.body);
    try{
        // findByIdAndUpdate it can also be used
        const tour = await Tour.findOneAndUpdate({_id : req.params.id}, req.body, {
            new : true,
            runValidators : true
        });
        res.status(200).json({
            status : "success",
            data : {
                tour
            }
        })
    }catch(err){
        res.status(404).json({
            status : "fail",
            message : err
        })
    }
}

exports.deleteTour = async (req, res) =>{
    try{
        const tour = await Tour.deleteOne({_id: req.params.id});
        res.status(204).json({
            status : "sucess",
            data : {
                tour
            }
        })
    }catch(err){
        res.status(400).json({
            status : "fail",
            message : err
        })
    }
}

exports.createTour = async (req, res) =>{
    
    ////////////// method 1 //////////////////

    // const newTour = new Tour({
    //     name : req.body.name,
    //     rating : req.body.rating,
    //     price : req.body.price
    // });
    // newTour.save().then(doc =>{
    //     console.log(doc);
    //     console.log("new document saves succefully");
    // });

    //////////////// method 2 ///////////////////

    try{
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status : "sucess",
            data : {
                message : newTour
            }
        });
    }catch(err){
        res.status(400).json({
            status : "fail",
            message : err
        })
    }
}

