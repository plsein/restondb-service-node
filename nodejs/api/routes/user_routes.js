
const { Auth } = require('../auth/auth');
const { CommonUtils } = require('../utils/common_utils');
const { errorHandler } = require('../middlewares/middleware');
const { UserService } = require('../services/user_service');

class UserRoutes {

  static setRoutes = (app) => {

    /**
     * Registration
     */
    app.post("/user-register", async (req, res, next) => {
      try {
        return await UserService.registration(req, res, next);
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Forgot password
     */
    app.post("/forgot-password", async (req, res, next) => {
      try {
        return await UserService.forgotPassword(req, res, next);
      } catch (err) {
        console.log(err);
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * OTP Validation
    */
    app.post("/otp-validation", async (req, res, next) => {
      try {
        return await UserService.otpValidation(req, res, next);
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Login
     */
    app.post("/login", async (req, res, next) => {
      try {
        return await UserService.login(req, res, next);
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

    /**
     * Change Password
     */
    app.post("/change-password", async (req, res, next) => {
      try {
        return await UserService.changePassword(req, res, next);
      } catch (err) {
        const error = CommonUtils.getErrorDetails(err);
        errorHandler(error, req, res, next);
      }
    });

  };

}

exports.UserRoutes = UserRoutes;
