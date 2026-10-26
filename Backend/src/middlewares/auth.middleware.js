const jwt = require('jsonwebtoken');
const BlackListToken = require('../Models/blacklist.models');


async function authUser(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7): null;
  const token = bearerToken || req.cookies?.token;

  if(!token){
    return res.status(401).json({
      message: "Unauthorized - No token provided"
    });
  }
  try {
    const isBlackListed = await BlackListToken.exists({token});
    if(isBlackListed) {
      return res.status(401).json({
        message: "Unauthorized - Token in required"
      });
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch(error) {
    if(error.name === "TokenExpiredError") {
      return res.status(401).json({
        message : "Access token required",
        code : "ACCESS_TOKEN_EXPIRED"
      });
    }
    if(error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message : "Invalid access token"
      });
    }
    console.error("Authentication error:",error);
    return res.status(500).json({
      message : "Authentication service error"
    });
  }
}
module.exports = authUser;
