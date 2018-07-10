const mongoose = require('mongoose');
const request = require('request')

const apiOptions = {
    api_server: 'http://localhost:3000/api',

}

if (process.env.NODE_ENV === 'production') {
  //  apiOptions.api_server = /your api server/
}
//const Locations = mongoose.model('Location')

module.exports.homeList = function(req, res) {
    const options = {
        url: apiOptions.api_server + '/locations',
        method: "GET",
        json: {},
        qs: {
            lat: 43.116420,
            lng: 131.882480,
            maxDistance: 20
        }
    };

    request(options, (err, response, body) => {
        if (err) return res.render('error', err);
  //      if (!body) // TODO Empty template
        renderHomeList(res, body)
    })
};

const formatDistance = (distance) => {
    if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + "km"
    } else {
        return distance + "m"
    }
}

const renderHomeList = (res, body) => {
    let message;
    if (!(body instanceof Array)) {
        message = "Api lookup error";
        body = []
    } else if (!body.length) {
        message = "No places found nearby"
    }

    const locations = body.map(location => {
        const locToReturn = {
            _id: location._id,
            name: location.name,
            adress: location.adress,
            rating: location.rating,
            distance: formatDistance(parseInt(location.distance)),
            facilities: location.facilities
        }
        return locToReturn;
    })
    res.render('locations_list', { 
        title: "Loc8r - find a place to work with wifi",
        pageHeader: {
            title: "Loc8r",
            strapline: "Find places to work with wifi near you!"
        },
        
        locations: locations,
        message: message
})
}

module.exports.locationInfo = (req, res) => {
    const options = {
        url: apiOptions.api_server + `/locations/${req.params.locationid}`,
        method: "GET",
        json: {},
    };

    request(options, (err, response, body) => {
        if (err) return res.render('error', err);
        console.log(body)
        renderLocationInfo(res, body)
    })
}

const renderLocationInfo = (res, location) => {
    res.render('locations_info', { 
        title: location.name,
        pageHeader: {
            title: location.name
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: location

 } )
} 

module.exports.addReview = (req, res) => {
    res.render('location_review_form', { title: "Add Review" })
}