const { GraphOps } = require('../graph/graphops');
const { RestOps } = require("../rest/restops");
const { Const } = require('../configs/const');
const { Utils } = require('../utils/utils');

class Service {
  
  /**
   * Select Data API
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next process
   * @returns JSON
   */
  static selectDataAPI = async (req, res, next) => {
    return await RestOps.restApi(req, 'select');
  };
  
  /**
   * Add Data API
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next process
   * @returns JSON
   */
  static addDataAPI = async (req, res, next) => {
    return await RestOps.restApi(req, 'add');
  };
  
  /**
   * Edit Data API
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next process
   * @returns JSON
   */
  static editDataAPI = async (req, res, next) => {
    return await RestOps.restApi(req, 'edit');
  };
  
  /**
   * Delete Data API
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next process
   * @returns JSON
   */
  static deleteDataAPI = async (req, res, next) => {
    return await RestOps.restApi(req, 'remove');
  };
  
  static getUploadFile = async (req, res, next) => {
    // some extra processing here if required like save file path to db
    return Utils.sendResponse(res, { data: {}, message: "File uploaded successfully" });
  };

  static getGraphqlSchema = async (req, res, next) => {
    const gqlQuery = Const.GRAPHQL_SCHEMA_INTROSPECT_GQL_QUERY;
    const response = await GraphOps.graphqlQuery(gqlQuery);
    return Utils.sendResponse(res, {data: response});
  };

}

exports.Service = Service;
