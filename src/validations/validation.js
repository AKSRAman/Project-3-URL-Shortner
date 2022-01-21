
const middleware = async (req, res, next) => {

    const value = req.body.longUrl;

    //---------------Validation performe on body which is provided by the client
    if (!Object.keys(req.body).length > 0) {
        return res.status(400).send({ status: false, msg: "Please provide body" });
    }
    if ((typeof value === 'undefined' || value === null)) {
        return res.status(400).send({ status: false, msg: "Please provide link or link field1" });
    }
    if ((typeof value === 'string' && value.trim().length === 0)) {
        return res.status(400).send({ status: false, msg: "Please provide link name or link field2" });
    }
    //-------------------validation is end-------------------//
    let longUrl = (req.body.longUrl).toLowerCase();
    if (!(longUrl.includes('//'))) {
        return res.status(400).send({ status: false, msg: 'Invalid longUrl' })
    }

    const urlParts = longUrl.split('//')
    const scheme = urlParts[0]
    const uri = urlParts[1]

    if (!(uri.includes('.'))) {
        return res.status(400).send({ status: false, msg: 'Invalid longUrl' })
    }

    const uriParts = uri.split('.')

    if (!(((scheme == "http:") || (scheme == "https:")) && (uriParts[0].trim().length) && (uriParts[1].trim().length))) {
        return res.status(400).send({ status: false, msg: 'Invalid longUrl' })
    }
    next();
} 
module.exports={middleware}