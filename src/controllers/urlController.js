const urlModel = require("../models/urlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')
const baseUrl = 'http://localhost:3000'

//-------we using redis here------//
const redis = require('redis');
const { promisify } = require("util");
const redisClient = redis.createClient(
   17604,
   "redis-17604.c264.ap-south-1-1.ec2.cloud.redislabs.com",
   { no_ready_check: true }
);
redisClient.auth("CzK9ssA2FWATEMk8BkSALczoTDvIIKGt", (err) => {
   if (err) throw err;
});
redisClient.on("connect", async () => {
   console.log("Connected to Redis Server Successfully");
});
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//---------Redis command ends-----------------------//

// This is the first post api to create longer to shorter URL.
const createUrl = async (req, res) => {
   try {
      //--------we are cheking that what client want to create short url of long url is exists in our cache or not//
      const cachedData = await GET_ASYNC(`${req.body.longUrl}`);
      const value = req.body.longUrl;
      if (cachedData) {
         console.log("CreateUrl,This data is fetched from cached data stored in cached memory")
         return res.status(200).send(JSON.parse(cachedData));
      }


      let longUrl = (req.body.longUrl).toLowerCase()
      const urlCode = shortid.generate().toLowerCase();

      let checkUrl = await urlModel.findOne({ longUrl });
      if (checkUrl) {
         return res.send({ message: "You have already created shortUrl for the requested URL as given below", data: checkUrl })
      }
      else {
         const shortUrl = baseUrl + '/' + urlCode
         const storedData = { longUrl, shortUrl, urlCode }
         let savedData = await urlModel.create(storedData);

         const myResult = await SET_ASYNC(`${savedData.longUrl}`, JSON.stringify(savedData), "EX", 20);
         console.log("This response data is now stored in Cached Memory for next 20 sec", myResult);
         return res.status(201).send({ status: true, data: savedData });
      }
   }
   catch (err) {
      return res.status(500).send({ status: false, data: err.message })
   }
}
// This is my second get api to redirect from shorter to original (longer) URL
const getUrl = async (req, res) => {
   try {
      const cachedData = await GET_ASYNC(`${req.params.code}`);
      if (cachedData) {
         console.log("This data is fetched from cached data stored in cached memory")
         const data = (JSON.parse(cachedData));
         return res.redirect(data.longUrl);
      }
      let paramsUrl = req.params.code
      const urlExist = await urlModel.findOne({ urlCode: paramsUrl })
      if (urlExist) {
         const myResult = await SET_ASYNC(`${req.params.code}`, JSON.stringify(urlExist), "EX", 20);
         console.log("This response data is now stored in Cached Memory for next 20 sec", myResult);
         return res.redirect(urlExist.longUrl)
      } else {
         return res.status(404).send('Sorry, there is no url for this request')
      }
   } catch (err) {
      res.status(500).send({ msg: err.message })
   }
}
module.exports.createUrl = createUrl
module.exports.getUrl = getUrl