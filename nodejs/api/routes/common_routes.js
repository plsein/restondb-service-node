
const { Auth } = require('../auth/auth');
const { CommonUtils } = require('../utils/common_utils');
const { errorHandler } = require('../middlewares/middleware');
const { CommonService } = require('../services/common_service');

class CommonRoutes {

  static setRoutes = (app) => {

    /**
     * Root path handler
     */
    app.get('/', (req, res, next) => {
      return CommonUtils.sendResponse(res, 'Hi !');
    });

    /**
     * Get Auth Token
     */
    app.post("/token", Auth.getToken);

    /**
     * Select Data
     */
    app.post("/api/select", async (req, res, next) => {
      try {
        return CommonUtils.sendResponse(res, await CommonService.selectDataAPI(req, res, next));
      } catch (err) {
        // console.log('err: ', err);
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Add Data
     */
    app.post("/api/add", async (req, res, next) => {
      try {
        return CommonUtils.sendResponse(res, await CommonService.addDataAPI(req, res, next));
      } catch (err) {
        // console.log(err);
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Edit Data
     */
    app.post("/api/edit", async (req, res, next) => {
      try {
        return CommonUtils.sendResponse(res, await CommonService.editDataAPI(req, res, next));
      } catch (err) {
        let error = CommonUtils.getErrorDetails(err);
        error["msg"] = (err.response?.data?.msg?.error)? err.response.data.msg.error : err.message;
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Delete Data
     */
    app.post("/api/delete", async (req, res, next) => {
      try {
        return CommonUtils.sendResponse(res, await CommonService.deleteDataAPI(req, res, next));
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Get GraphQL Schema
     */
    app.get('/graph-schema', (req, res, next) => {
      return CommonService.getGraphqlSchema();
    });

    /**
     * File Upload
     */
    app.post("/uploads", CommonUtils.fileUploader, async (req, res, next) => {
      try {
        return await CommonService.getUploadFile(req, res, next);
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

  };

}

exports.CommonRoutes = CommonRoutes;
