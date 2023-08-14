const express = require("express");
const router = express.Router();
const tourController = require("./../controllers/tourController");

// router.param("id", (req, res, next, val)=>{ // middleware on certain params
//     console.log(val);
//     if(!tourController.validID(val)){
//         return res.status(404).json({
//             status : "fail",
//             message : "invalid id"
//         })
//     }
//     next();
// })

//router.param("id", tourController.checkID);

//router.route("/top-5-cheap").get(tourController.getTop5Cheap);

// by middleware like this :- 

router.route("/top-5-cheap").get(tourController.aliasTop5Tour, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router.route("/")
          .get(tourController.getAllTours)
          .post(/*tourController.checkBody,*/ tourController.createTour)

router.route("/:id")
          .get( tourController.getTour)
          .patch( tourController.updateTour)
          .delete( tourController.deleteTour)

          
module.exports = router;