/**
 * Imports
 */
const fs = require('fs');
const multer  = require('multer');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { parse } = require("graphql");
const { type } = require("os");
const { gql } = require('@apollo/client');
const { Config } = require("../configs/config");
const { Const } = require('../configs/const');
const { appLog } = require('../configs/logger');

class CommonUtils {

  /**
   * Determine whether the given `value` is an object.
   * @param value object
   * @returns boolean
   */
  static isObject = (value) => {
    return Object.prototype.toString.call(value) === '[object Object]';
  };

  /**
   * Read a file
   * @param filePath String file path
   */
  static readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
  };

  static getErrorDetails = (err) => {
    let error = {};
    error["status"] = (err.response?.status)? err.response.status : 500;
    error["msg"] = (err.response?.data?.msg)? err.response.data.msg : Const['REQ_PROCESS_ERR_MSG'];
    return error;
  }

  static makeJSONResponse = (content, code=200, msg={"msg":"Status Ok"}) => {
    return {"code":code, "message":msg, "data": content};
  }

  /**
   * Send response
   * @param res response object
   * @param output output object
   */
  static sendResponse = (res, output, code=200, msg={"msg":"Status Ok"}, isJSON=true, buildJSON=false) => {
    if(isJSON) {
      if (buildJSON) {
        return res.json(CommonUtils.makeJSONResponse(output, code, msg));
      }
      return res.json(output);
    }
    return res.send(output);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static reqLog = (req, msg) => {
    req.log.info(msg);
    appLog.info(msg);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static stringOccurance = (text) => {
    let regex = /'/gi;
    let count = (text.match(regex) || []).length;
    return count;
  };

  /**
   * Escape string
   * @param text string
   * return string
   */
  static escapeString = (text) => {
    // Uncomment after proper testing
    // const regex_slash = {"search": /[\\]/g, "replace": "\\\\"};
    // Avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen = {"search": /--/g, "replace": "- - "};
    // Yet another avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen_ya = {"search": /--/g, "replace": "&minus;&minus;"};
    // Avoid multiple sql statements at once
    // This will fail sql query if semicolon is not quoted and thus prevent sql injection
    const regex_semicolon = {"search": /;/g, "replace": "&#59;"};
    let regex_list = [regex_semicolon, regex_hyphen, regex_hyphen_ya];  // regex_slash
    // Avoid odd occurances of quote
    // This will fail sql query if quote is not closed properly and thus prevent sql injection
    if (CommonUtils.stringOccurance(text) % 2 != 0) {
      const regex_quote = {"search": /'/g, "replace": "''"};
      regex_list.push(regex_quote);
    }
    // Replace bad characters
    // This will fail sql query if bad characters not at wrong place otherwise the query will execute safely
    for (const regex_replace in regex_list) {
      text = text.replace(regex_replace["search"], regex_replace["replace"]);
    }
    return text.trim();
  };

  /**
   * File Uploader
   */
  static fileUploader = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdir(`uploads/${req.body.entity_type}//${req.body.entity_id}//${req.body.entity_field}//`, { recursive: true }, (error) => {
          if (error) {
            console.log(error);
          } else {
            const filenames = fs.readdirSync(
              `uploads/${req.body.entity_type}/${req.body.entity_id}/${req.body.entity_field}`
            );
            filenames.forEach((instance) => {
              if (instance !== file.originalname) {
                fs.unlink(
                  `uploads/${req.body.entity_type}/${req.body.entity_id}/${req.body.entity_field}/${instance}`,
                  (err) => {
                    if (err) throw err;
                  }
                );
              }
            });
            cb(null, `uploads/${req.body.entity_type}/${req.body.entity_id}/${req.body.entity_field}/`);
          }
        });
      },
      filename: (req, file, cb) => {
        const filename = `${req.body.entity_type}/${req.body.entity_id}/${req.body.entity_field}/${file.originalname}`;
        // user/{id}/profile/
        cb(null, file.originalname);
      },
    }),
  }).single("file");

  /**
   * Escape string
   * @param text string
   * return string
   */
  static sendEmail = async (toEmail, subject, content) => {
    if(Config.SMPT_CONFIG?.auth?.user && Config.SMPT_CONFIG.auth.user.length > 0) {
      const transporter = nodemailer.createTransport(Config.SMPT_CONFIG);
      await transporter.sendMail({
        from: Config.SMPT_CONFIG.auth.user,
        to: toEmail,
        subject: subject,
        html: content,
      });
      return true;
    } else {
      appLog.info(`SMTP not found`);
      return false;
    }
  };

}

exports.CommonUtils = CommonUtils;
