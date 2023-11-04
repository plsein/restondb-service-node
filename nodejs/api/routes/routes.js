
const { Auth } = require('../auth/auth');
const { Utils } = require('../utils/utils');
const { errorHandler } = require('../middlewares/middleware');
const { Service } = require('../services/service');

class Routes {

  static setRoutes = function(app) {

    /**
     * Root path handler
     */
    app.get('/', function (req, res, next) {
      return Utils.sendResponse(res, 'Hi !');
    });
  
    /**
     * Get auth token
     */
    app.post("/token", Auth.getToken);
  
    /**
     * Select Data
     */
    app.post("/api/select", async function (req, res, next) {
      try {
        return Utils.sendResponse(res, await Service.selectDataAPI(req, res, next));
      } catch (err) {
        // console.log('err: ', err);
        err["status"] = (err.response && err.response.status)? err.response.status : 501;
        err["msg"] = (err.response && err.response.data && err.response.data.msg)? err.response.data.msg : 'Bad Request';
        errorHandler(err, req, res, next);
      }
    });
  
    /**
     * Add Data
     */
    app.post("/api/add", async function (req, res, next) {
      try {
        return Utils.sendResponse(res, await Service.addDataAPI(req, res, next));
      } catch (err) {
        // console.log(err);
        err["status"] = (err.response && err.response.status)? err.response.status : 501;
        err["msg"] = (err.response && err.response.data && err.response.data.msg)? err.response.data.msg : 'Bad Request';
        errorHandler(err, req, res, next);
      }
    });
  
    /**
     * Edit Data
     */
    app.post("/api/edit", async function (req, res, next) {
      try {
        return Utils.sendResponse(res, await Service.editDataAPI(req, res, next));
      } catch (err) {
        err["status"] = (err.response && err.response.status)? err.response.status : 501;
        err["msg"] = (err.response && err.response.data && err.response.data.msg && err.response.data.msg.error)? err.response.data.msg.error : err.message;
        errorHandler(err, req, res, next);
      }
    });
  
    /**
     * Delete Data
     */
    app.post("/api/delete", async function (req, res, next) {
      try {
        return Utils.sendResponse(res, await Service.deleteDataAPI(req, res, next));
      } catch (err) {
        err["status"] = (err.response && err.response.status)? err.response.status : 501;
        err["msg"] = (err.response && err.response.data && err.response.data.msg)? err.response.data.msg : 'Bad Request';
        errorHandler(err, req, res, next);
      }
    });
  
    /**
     * Get GraphQL Schema
     */
    app.get('/graph-schema', function (req, res, next) {
      return Service.getGraphqlSchema();
    });
  
    /**
     * File Upload
     */
    app.post("/uploads", Utils.fileUploader, async function (req, res, next) {
      try {
        return await Service.getUploadFile(req, res, next);
      } catch (err) {
        err["status"] = (err.response && err.response.status)? err.response.status : 501;
        errorHandler(err, req, res, next);
      }
    });
  
  };

}

exports.Routes = Routes;
