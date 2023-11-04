const axios = require('axios').default;
const { Auth } = require("../auth/auth");
const { Config } = require("../configs/config");

class RestOps {

  /**
   * REST API call
   * @param {*} req Request Object
   * @param {*} path Request uri path
   * @returns JSON
   */
  static restApi = async (req, path, baseURI=null) => {
    const oauthToken = await Auth.getServiceToken();
    const baseRestURI = (baseURI && (baseURI.indexOf('http://') || baseURI.indexOf('https://')))? baseURI : Config['DB_SERVICE_URI'] + '/api';
    const restUri = baseRestURI + '/' + path;
    const param = req.body? req.body : {};
    const { data } = await axios.post(restUri, param, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + oauthToken
      }
    });
    return data;
  };

}

exports.RestOps = RestOps;
