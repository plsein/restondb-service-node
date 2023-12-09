/**
 * User Service
 */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { GraphOps } = require('../graph/graphops');
const { Config } = require('../configs/config');
const { Const } = require('../configs/const');
const { CommonUtils } = require('../utils/common_utils');

class UserService {

  /**
   * Function Registration
   * @param {*} req req object
   * @param {*} res response object
   * @param {*} next next process
   * @returns user created message
   */
  static registration = async (req, res, next) => {
    const password = crypto.createHash(Const.PSWD_ALGO).update(req.body.password).digest(Const.PSWD_ENC_FORMAT);
    const gqlMutation = Const.USER_SIGNUP_GQL_MUTATE;
    const response = await GraphOps.graphqlMutate(gqlMutation, {
      username: req.body.username,
      password: password,
      email: req.body.email,
      active: req.body.active,
      // employeeId: req.body.employeeId,
      // roleId: req.body.roleId
    });
    if (JSON.stringify(response.data.createUserProfile.userProfile).length > 2) {
      return CommonUtils.sendResponse(res, {data: [], code: 200, msg: "User created successfully"});
    }
    return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "User registration failed, check details"});
  };

  /**
   * Function Login
   * @param {*} req req object
   * @param {*} res response object
   * @param {*} next next process
   * @returns user access token
   */
  static login = async (req, res, next) => {
    const gqlQuery = Const.USER_PSWD_GQL_QUERY;
    if (!req.body.email || !req.body.password) {
      return CommonUtils.sendResponse(res, {data:[], code: 400, msg: "Enter valid credentials"});
    }
    const password = crypto.createHash(Const.PSWD_ALGO).update(req.body.password).digest(Const.PSWD_ENC_FORMAT);
    const response = await GraphOps.graphqlQuery(gqlQuery, {email: req.body.email, password: password});
    if (response.data.userProfiles.nodes.length > 0) {
      return CommonUtils.sendResponse(res, {data: [{token: jwt.sign({
          uid: response.data.userProfiles.nodes[0].id,
          email: response.data.userProfiles.nodes[0].email,
          name: response.data.userProfiles.nodes[0].name,
          scope: response.data.userProfiles.nodes[0].role?.name,
        }, Config['JWT_AUTH_SECRET'], {algorithm: Const.JWT_ALGO, expiresIn: Config['TOKEN_EXPIRY_MILLISEC']})
      }], code: 200, msg: "Login successful"});
    }
    return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "Enter valid credentials"});
  };

  /**
   * Function Forgot Password
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next process
   * @returns JSON object
   */
  static forgotPassword = async (req, res, next) => {
    const gqlQuery = Const.EMAIL_EXISTS_GQL_QUERY;
    const response = await GraphOps.graphqlQuery(gqlQuery, {email: req.body.email});
    if (response.data.userProfiles.nodes.length == 0) {
      return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "User does not Exists"});
    }
    const random = Math.floor(Math.random() * 9000 + 1000);
    let updated_datetime = new Date();
    updated_datetime.setMinutes(updated_datetime.getMinutes() + 15);
    updated_datetime = updated_datetime.toISOString().slice(0, -1);
    const gqlMutate = Const.FP_PROFILE_GQL_MUTATE;
    const responseMutate = await GraphOps.graphqlMutate(gqlMutate, {
      otp: random,
      otp_expire_time: updated_datetime,
      id: response.data.userProfiles.nodes[0].id,
    });
    if (JSON.stringify(responseMutate.data.updateUserProfile.userProfile).length > 2) {
      if (await CommonUtils.sendEmail(req.body.email, "Password verification token", random)) {
        return CommonUtils.sendResponse(res, {data: [], code: 200, msg: "Email sent successfully"});
      } else {
        return CommonUtils.sendResponse(res, {data: [], code: 500, msg: "Email not sent, please check app configuration"});
      }
    }
    return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "Error, please try again"});
  };

  /**
   * Function OTP Token Validation
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next next process
   * @returns JSON object
   */
  static otpValidation = async (req, res, next) => {
    const gqlQuery = Const.OTP_VALIDATION_GQL_QUERY;
    const gqlMutate = Const.RESET_PSWD_GQL_MUTATE;
    let dateTime = new Date();
    dateTime = dateTime.toISOString().slice(0, -1);
    const responseQuery = await GraphOps.graphqlQuery(gqlQuery, {email: req.body.email});
    if (responseQuery.data.userProfiles.nodes.length == 0) {
      return CommonUtils.sendResponse(res, {data: [], codde: 400, msg: "User does not Exists"});
    }
    if (new Date(responseQuery.data.userProfiles.nodes[0].otpExpireTime) >= new Date(dateTime)) {
      if (
        responseQuery.data.userProfiles.nodes[0].otp == req.body.otp &&
        responseQuery.data.userProfiles.nodes[0].email == req.body.email &&
        req.body.new_password == req.body.confirm_password
      ) {
        const password = crypto.createHash(Const.PSWD_ALGO).update(req.body.new_password).digest(Const.PSWD_ENC_FORMAT);
        const responseMutate = await GraphOps.graphqlMutate(gqlMutate, {
          id: responseQuery.data.userProfiles.nodes[0].id,
          password: password,
        });
        if (JSON.stringify(responseMutate.data.updateUserProfile.userProfile).length > 2) {
          // send email
          if (await CommonUtils.sendEmail(req.body.email, "Password changed", "Password changed successfully")) {
            return CommonUtils.sendResponse(res, {data: [], code: 200, msg: "Email sent successfully"});
          } else {
            return CommonUtils.sendResponse(res, {data: [], code: 500, msg: "Email not sent, please check app configuration"});
          }
        }
      }
    } else {
      return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "OTP Expired"});
    }
    return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "Verification failed, incorrect details"});
  };

  /**
   * Function Change Password
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next next process
   * @returns JSON object
   */
  static changePassword = async (req, res, next) => {
    const gqlQuery = Const.CHNG_PSWD_USR_GQL_QUERY;
    const gqlMutate = Const.CHNG_PSWD_GQL_MUTATE;
    const responseQuery = await GraphOps.graphqlQuery(gqlQuery, {id: req.body.id});
    const old_password = crypto.createHash(Const.PSWD_ALGO).update(req.body.old_password).digest(Const.PSWD_ENC_FORMAT);
    if (
      req.body.new_password == req.body.confirm_password &&
      old_password == responseQuery.data.userProfile?.password
    ) {
      const password = crypto.createHash(Const.PSWD_ALGO).update(req.body.new_password).digest(Const.PSWD_ENC_FORMAT);
      const responseMutate = await GraphOps.graphqlMutate(gqlMutate, {id: req.body.id, password: password});
      if (JSON.stringify(responseMutate.data.updateUserProfile.userProfile).length > 2) {
        return CommonUtils.sendResponse(res, {data: [], code: 200, msg: "Password changed successfully"});
      }
    } else {
      return CommonUtils.sendResponse(res, {data: [], code: 400, msg: "Incorrect details"});
    }
  };


}

exports.UserService = UserService;
