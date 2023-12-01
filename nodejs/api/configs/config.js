require("dotenv").config();

class Config {
  
  static APP_PORT = process.env.APP_PORT;

  static AUTH_KEY = process.env.AUTH_KEY;
  
  static AUTH_SECRET = process.env.AUTH_SECRET;
  
  static OAUTH_URI = process.env.OAUTH_URI;
  
  static DB_SERVICE_URI = process.env.DB_SERVICE_URI;

  static PROXY_TO_URI = process.env.PROXY_TO_URI;

  static PROXY_ON_PATH = process.env.PROXY_ON_PATH;
  
  static JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;
  
  static TOKEN_PRIOR_EXPSEC= process.env.TOKEN_PRIOR_EXPSEC;
  
  static TOKEN_EXPIRY_MILLISEC = process.env.TOKEN_EXPIRY_MILLISEC;
  
  static SMPT_CONFIG = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER_EMAIL,
      pass: process.env.SMTP_USER_PASSWORD
    }
  }
  
  static LOG_DIR = process.env.LOG_DIR;

}

exports.Config = Config;
