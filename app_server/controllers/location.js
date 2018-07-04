module.exports.homeList = function(req, res) {
    res.render('locations_list', { title: "Home" })
};

module.exports.locationInfo = (req, res) => {
    res.render('locations_info', { title: "Location Info" } )
}

module.exports.addReview = (req, res) => {
    res.render('location_review_form', { title: "Add Review" })
}