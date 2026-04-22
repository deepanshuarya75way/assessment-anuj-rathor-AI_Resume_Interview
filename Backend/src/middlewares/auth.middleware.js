const jwt = require('jsonwebtoken');
const BlackListToken = require('../Models/blacklist.models');


async function authUser(req, res, next) {
  const token = req.cookies.token;
  if(!token){
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const isBlackListed =  await BlackListToken.findOne({ token });

  if(isBlackListed){
    return res.status(401).json({
      message: "Unauthorized - Token is blacklisted"
    });
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }
  }

module.exports = authUser;
