/**
 * Imports
 */
const jwt = require("jsonwebtoken");
const { CommonUtils } = require('../utils/common_utils');
const { errorHandler } = require('../middlewares/middleware');
const axios = require('axios').default;
const { Config } = require('../configs/config');

class Auth {
  
  /**
   * Service level token
   */
  static #serviceToken = '';

  /**
   * Auth token generator
  */
  static #authToken = (key, secret) => {
    if(key === Config['AUTH_KEY'] && secret === Config['AUTH_SECRET']) {
      return {
        "token": jwt.sign(
          {role: "service", user_id: 0},  // payload
          Config['JWT_AUTH_SECRET'],
          {algorithm: "HS256", expiresIn: Config['TOKEN_EXPIRY_MILLISEC']}  // Milliseconds
        )
      };
    } else {
      throw new Error("Authentication Error");
    }
  };

  /**
   * New auth token from server
   */
  static #newServiceToken = async () => {
    const { data } = await axios.post(Config['OAUTH_URI'], {
      key: Config['AUTH_KEY'],
      secret: Config['AUTH_SECRET']
    },{
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return data.data.token;
  };

  /**
   * Get auth token from server
   * @param {*} req request object
   * @param {*} res rersponse object
   * @param {*} next callback
   * @returns object
   */
  static getToken = (req, res, next) => {
    let key = req.body.key? req.body.key: '';
    let secret = req.body.secret? req.body.secret: '';
    try {
      return CommonUtils.sendResponse(res, Auth.#authToken(key, secret), 200, {'status':'ok'}, true, true);
    } catch(err) {
      err['status'] = 401;
      errorHandler(err, req, res, next);
    }
  };

  /**
   * Get auth token
   * @returns string
   */
  static getServiceToken = async () => {
    let jwtToken = Auth.#serviceToken;
    try {
      if (jwtToken.length > 0) {
        let token_parts = jwtToken.split('.');
        let bufferObj = Buffer.from(token_parts[1], "base64");
        let info = JSON.parse(bufferObj.toString("utf8"));
        if ((info['exp'] - Config['TOKEN_PRIOR_EXPSEC']) > new Date().getTime()/1000) {
          return Auth.#serviceToken;
        }
      }
    } catch (err) {
      CommonUtils.appLog('Error: ', err);
    }
    Auth.#serviceToken = await Auth.#newServiceToken();
    return await Auth.#serviceToken;
  };

}

exports.Auth = Auth;
