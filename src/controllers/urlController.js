const urlModel = require("../models/urlModel.js")
const validUrl = require('valid-url')
const shortid = require('shortid')
const baseUrl = 'http://localhost:3000'

// This is the first post api to create longer to shorter URL...................//
const createUrl = async (req, res) => {
   try {
      const longUrl = req.body.longUrl
      if (!validUrl.isUri(baseUrl)) {
         return res.status(401).send('Invalid base URL')
      }
      if (validUrl.isUri(longUrl)) {
         const urlCode = shortid.generate().toLowerCase()
         let checkUrl = await urlModel.findOne({ longUrl })
         if (checkUrl) {
            res.send({ message: "You have already created shortUrl for the requested URL as given below", data: checkUrl })
         } else {
            const shortUrl = baseUrl + '/' + urlCode
            const storedData = { longUrl, shortUrl, urlCode }
            let savedData = await urlModel.create(storedData);
            res.status(201).send({ status: true, data: savedData });
         }
      } else {
         res.status(401).send('Invalid longUrl')
      }
   } catch (err) {
      res.status(500).send({ status: false, data: err.message })
   }
}

//-----------------------------------------------------------------------------//
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

const getUrl = async (req, res) => {
   try {
      let paramsUrl = req.params.code
      const cachedData = await GET_ASYNC(`${paramsUrl}`)
      if (cachedData) {
         // console.log( JSON.parse(cachedData))
         console.log("This data is fetched from cached data stored in cached memory");
         let fetch = JSON.parse(cachedData)
         return res.redirect(fetch.longUrl)
      } else {
         const urlExist = await urlModel.findOne({ urlCode: paramsUrl })
         const myResult = await SET_ASYNC(`${paramsUrl}`, JSON.stringify(urlExist), "EX", 20)
         console.log("This response data is stored in Cached Memory for next 20 sec", myResult)
         return res.redirect(urlExist.longUrl)
      }
   } catch (err) {
      res.status(500).send('Server Error Occurred')
   }
}

module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;


//["http://www.sample.com","https://www.sample.com/","https://www.sample.com#","http://www.sample.com/xyz",/
//"http://www.sample.com/#xyz","www.sample.com","www.sample.com/xyz/#/xyz","sample.com","sample.com?name=foo","http://www.sample.com#xyz","http://www.sample.c"];
//a.map(x=>console.log(x+" => "+b.test(x)));
// let a=["http://wwww.samplecom"];
// let b=/^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
// console.log(b.test(a))


// const regex = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;
// const str = `http://www.sample.com'
// // https://www.sample.com
// // http://www.sample.com/xyz
// // www.sample.com
// // www.sample.com/xyz/#/xyz
// // sample.com
// // www.sample.com
// // mofiz.com
// // kolim.com
// // www.murikhao.www.sample.com
// // http://murihao.www.sample.com
// // http://www.sample.com/xyz?abc=dkd&p=q&c=2
// // www.sample.gov.bd
// // www.sample.com.en
// // www.sample.vu

// let m;

// while ((m = regex.exec(str)) !== null) {

//     if (m.index === regex.lastIndex) {
//         regex.lastIndex++;
//     }
//     console.log("matched :"+m[0]);
// }