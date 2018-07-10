module.exports.sendJSONResponse = (res, statusCode, content) => {
    res.status(statusCode);
    res.json(content)
}