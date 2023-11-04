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

class Utils {

  /**
   * Determine whether the given `value` is an object.
   * @param value object
   * @returns boolean
   */
  static isObject = function(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  };

  /**
   * Read a file
   * @param filePath String file path
   */
  static readFile = function(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  };

  static makeJSONResponse = function(content, code=200, msg={"status":"ok"}) {
    return {"code":code, "msg":msg, "data":content};
  }

  /**
   * Send response
   * @param res response object
   * @param output output object
   */
  static sendResponse = function(res, output, code=200, msg={"status":"ok"}, isJSON=true, buildJSON=false) {
    if(isJSON) {
      if (buildJSON) {
        return res.json(Utils.makeJSONResponse(output, code, msg));
      }
      return res.json(output);
    }
    return res.send(output);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static reqLog = function(req, msg) {
    req.log.info(msg);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static stringOccurance = function(text) {
    let regex = new RegExp("'", "gi");
    let count = (text.match(regex) || []).length;
    return count;
  };

  /**
   * Escape string
   * @param text string
   * return string
   */
  static escapeString = function(text) {
    // Uncomment after proper testing
    // const regex_slash = {"search": /[\\]/g, "replace": "\\\\"};
    // Avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen = {"search": new RegExp("--", 'g'), "replace": "- - "};
    // Yet another avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen_ya = {"search": new RegExp("--", 'g'), "replace": "&minus;&minus;"};
    // Avoid multiple sql statements at once
    // This will fail sql query if semicolon is not quoted and thus prevent sql injection
    const regex_semicolon = {"search": new RegExp(";", 'g'), "replace": "&#59;"};
    let regex_list = [regex_semicolon, regex_hyphen, regex_hyphen_ya];  // regex_slash
    // Avoid odd occurances of quote
    // This will fail sql query if quote is not closed properly and thus prevent sql injection
    if (Utils.stringOccurance(text) % 2 != 0) {
      const regex_quote = {"search": new RegExp("'", 'g'), "replace": "''"};
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
      destination: function (req, file, cb) {
        fs.mkdir(`uploads/${req.body.entity_type}//${req.body.entity_id}//${req.body.entity_field}//`, { recursive: true }, (error) => {
          if (error) {
            console.log(error);
          } else {
            filenames = fs.readdirSync(
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
      filename: function (req, file, cb) {
        const filename = `${req.body.entity_type}/${req.body.entity_id}/${req.body.entity_field}/${file.originalname}`;
        // user/{id}/profile/
        cb(null, file.originalname);
      },
    }),
  }).single("file");

}

exports.Utils = Utils;
