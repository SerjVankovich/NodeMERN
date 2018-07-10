const mongoose = require('mongoose');
const Locations = mongoose.model('Location')
const sendJSONResponse = require('./sendJSON').sendJSONResponse;

const theEarth = (function() {
    const earthRadius = 6371;

    const getDistanceFromRads = (rads) => {
        return parseFloat(rads * earthRadius);
    };

    const getRadsFromDistance = (distance) => {
        return parseFloat(distance / earthRadius)
    }

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    }
})();


module.exports.locationsListByDistance = (req, res) => {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseFloat(req.query.maxDistance)

    if ((!lng && lng!==0) || (!lat && lat!==0) || !maxDistance) {
        sendJSONResponse(res, 404, {
            message: "Incorrect query"
        });
        return;
    }

    const point = {
        type: "Point",
        coordinates: ''
    };

    const options = {
        near: [lng, lat],
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        limit: 10,
        
    }

    Locations.aggregate([
        {
            "$geoNear": {
                "near": {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                spherical: true,
                distanceField: 'dist',
                maxDistance: maxDistance
            }
        },
        { "$skip": 0 },
        { "$limit": 10 }
    ], (err, results) => {
        console.log(results);
            if (err) {
                sendJSONResponse(res, 404, err)
                return;
            }
            const locations = getLocationsFromQuery(results);
            sendJSONResponse(res, 200, locations)
    });
}

const getLocationsFromQuery = results => {
    const locations = []
        results.forEach(doc => {
            locations.push({
                distance: theEarth.getDistanceFromRads(doc.dist),
                name: doc.name,
                adress: doc.adress,
                rating: doc.rating,
                facilities: doc.facilities,
                _id: doc._id
            });
        });
    return locations;
}

module.exports.locationsCreate = (req, res) => {
    Locations.create({
        name: req.body.name,
        adress: req.body.adress,
        facilities: req.body.facilities.split(','),
        coords: [
            parseFloat(req.body.lng),
            parseFloat(req.body.lat)
        ],
        openingTimes: [
            {
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1
            },
            {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
            }
        ]
    }, (err, location) => {
        if (err) {
            return sendJSONResponse(res, 400, err)
        }
        sendJSONResponse(res, 200, {
            message: "Successfully added"
        })
    })
    
};

module.exports.locationsReadOne = (req, res) => {
    const id = req.params.locationid;
    if(req.params && id) {
        Locations
        .findById(id)
        .exec((err, location) => {
            if(!location) {
                sendJSONResponse(res, 404, {
                    message: "Location not found"
                })
                return;
            } else if (err) {
                sendJSONResponse(res, 404, err);
                return;
            }
            sendJSONResponse(res, 200, location)
        })
    } else {
        sendJSONResponse(res, 404, {
            message: "No locationid in request"
        })
    }
};

module.exports.locationsUpdateOne = (req, res) => {
    const locationId = req.params.locationid;
    if (!locationId) {
        return sendJSONResponse(res, 404, {
            message: "No locationid in request"
        });
    }
    Locations.findById(locationId)
    .select("-reviews -rating")
    .exec((err, location) => {
        if (err) return sendJSONResponse(res, 400, err);
        if (!location) return sendJSONResponse(res, 404, { message: "Location not found" });
        location.name = req.body.name;
        location.adress = req.body.adress;
        location.facilities = req.body.facilities.split(',');
        location.coords = [ parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [
            {
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1
            },
            {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
            }
        ]

        location.save((err, location) => {
            if (err) return sendJSONResponse(res, 400, err);
            sendJSONResponse(res, 200, location)
        })
    })
};

module.exports.locationsDeleteOne = (req, res) => {
    const locationId = req.params.locationid;
    if (!locationId){
        return sendJSONResponse(res, 404, {
            message: "No locationid in request"
        })
    };
    Locations.findByIdAndRemove(locationId)
        .exec((err, location) => {
            if (err) return sendJSONResponse(res, 400, err);
            if (!location) {
                return sendJSONResponse(res, 404, {
                    message: "Location not found"
                })
            }
            return sendJSONResponse(res, 200, {
                message: `Location with id: ${locationId} was deleted`
            });
        })
    }
