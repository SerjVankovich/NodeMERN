const mongoose = require('mongoose');
const Locations = mongoose.model('Location')

const sendJSONResponse = require('./sendJSON').sendJSONResponse;

module.exports.reviewsCreate = (req, res) => {
    const locationId = req.params.locationid;
    if (!locationId) {
        return sendJSONResponse(res, 404, {
            message: "No locationid in request"
        })
    }

    Locations
        .findById(locationId)
        .select('rating reviews')
        .exec((err, location) => {
            if (err) {
                sendJSONResponse(res, 404, err)
                return;
            } 
            doAddReview(req, res, location)
        })
};

const doAddReview = (req, res, location) => {
    if (!location) {
        return sendJSONResponse(res, 404, {
            message: "This locationid not found"
        })
    }
    console.log(location)
    location.reviews.push({
        author: req.body.author,
        rating: req.body.rating,
        reviewText: req.body.reviewText
    });
    location.rating = updateAverageRating(location.reviews);
    location.save((err, location) => {
        if (err) {
            return sendJSONResponse(res, 400, err)
        }
        
        const thisReview = location.reviews[location.reviews.length - 1];
        
        sendJSONResponse(res, 201, thisReview)
    })
};

const updateAverageRating = (reviews) => {
    let summRatings = 0
    reviews.forEach((review) => {
        summRatings += parseInt(review.rating);
    });
    return parseInt(summRatings / (reviews.length))
}

module.exports.reviewsReadOne = (req, res) => {
    const reviewId = req.params.reviewid
    const locationid = req.params.locationid;
    
    if(req.params && locationid && reviewId) {
        Locations
            .findById(locationid)
            .select('name reviews')
            .exec((err, location) => {
                if (!location) {

                    sendJSONResponse(res, 404, {
                        message: "location not found"
                    })

                    return;
                } else if (err) {

                    sendJSONResponse(res, 404, err)
                    return;

                }
                
                if (location.reviews && location.reviews.length > 0) {
                    const review = location.reviews.id(reviewId);

                    if(!review) {
                        sendJSONResponse(res, 404, {
                            message: "Review not found"
                        })
                        return;
                    } 

                    const response = {
                        location: {
                            name: location.name,
                            id: locationid
                        }, 
                        review: review
                    };
                    sendJSONResponse(res, 200, response)
                } else {
                    sendJSONResponse(res, 404, {
                        message: "No reviews found"
                    })
                }

            })
    } else {
        sendJSONResponse(res, 404, {
            message: "No locationid or reviewid on request"
        })
    }
}

module.exports.reviewsUpdateOne = (req, res) => {
    const locationId = req.params.locationid;
    const reviewId = req.params.reviewid;

    if(!locationId || !reviewId) {
        return sendJSONResponse(res, 404, {
            message: "No locationid or reviewid in request"
        });
    }

    Locations
        .findById(locationId)
        .select('reviews rating')
        .exec((err, location) => {
            if (err) {
                return sendJSONResponse(res, 400, err)
            }
            if (!location) {
                return sendJSONResponse(res, 404, {
                    message: "Location not found"
                })
            }
            const review = location.reviews.find(review => {
                return (review._id == reviewId)
            });
            if (!review) {
                return sendJSONResponse(res, 404, {
                    message: "Review not found"
                })
            }
            review.rating = req.body.rating;
            review.author = req.body.author;
            review.reviewText = req.body.reviewText;
            location.rating = updateAverageRating(location.reviews);

            location.save((err, location) => {
                if (err) return sendJSONResponse(res, 400, err);
                return sendJSONResponse(res, 200, location)
            })

        });
    
};

module.exports.reviewsDeleteOne = (req, res) => {
    const reviewId = req.params.reviewid;
    const locationId = req.params.locationid;
    if(!reviewId || !locationId) {
       return sendJSONResponse(res, 404, {
           message: "No reviewid or locationid in request"
       });
    }
    Locations
        .findById(locationId)
        .select("rating reviews")
        .exec((err, location) => {
            if (err) return sendJSONResponse(res, 400, err);
            if (!location) {
                return sendJSONResponse(res, 404, {
                    message: "Location not found"
                });
            };
            console.log(location)
            const review = location.reviews.id(reviewId);
            if (!review) {
                return sendJSONResponse(res, 404, {
                    message: "Review not found"
                })
            }
            review.remove()
            location.rating = updateAverageRating(location.reviews);
            location.save((err, location) => {
                if (err) return sendJSONResponse(res, 400, err);
                return sendJSONResponse(res, 200, {
                    message: `Review with id: ${reviewId} has been successfully deleted`
                })
            })
        })
}