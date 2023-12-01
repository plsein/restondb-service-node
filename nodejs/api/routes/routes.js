
const { CommonRoutes } = require('../routes/common_routes');
const { UserRoutes } = require('../routes/user_routes');

class Routes {

  /**
   * Function Set Routes
   * @param {*} app framework app object
   */
  static setRoutes = (app) => {
    CommonRoutes.setRoutes(app);
    UserRoutes.setRoutes(app);
  };

}

exports.Routes = Routes;
