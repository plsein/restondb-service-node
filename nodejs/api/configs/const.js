const { gql } = require('@apollo/client');

class Const {

  static JWT_ALGO = 'HS256';
  static PSWD_ALGO = 'sha256';
  static PSWD_ENC_FORMAT = 'hex';
  static REQ_PROCESS_ERR_MSG = 'Error processing request';
  static TWELVE = 12;
  static DEFAULT_USER_ROLE = 'Public_C1';

  static GRAPHQL_SCHEMA_INTROSPECT_GQL_QUERY = gql `query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types { ...FullType }
      directives { name description  locations args { ...InputValue } }
    }
  }
  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name description args { ...InputValue } type { ...TypeRef }
      isDeprecated deprecationReason
    }
    inputFields { ...InputValue }
    interfaces { ...TypeRef }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes { ...TypeRef }
  }
  fragment InputValue on __InputValue {
    name
    description type { ...TypeRef }
    defaultValue
  }
  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
      kind
      name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType { kind name }
              }
            }
          }
        }
      }
    }
  }`;

  static USER_SIGNUP_GQL_MUTATE = gql `mutation register(
    $username: String!
    $email: String!
    $password: String!
    $active: Boolean!
  ) {
    createUserProfile(
      input: {
        userProfile: {
          name: $username
          email: $email
          password: $password
          active: $active
        }
      }
    ) {
      userProfile {
        active
        email
        password
        profile
        name
        employeeId
      }
    }
  }`;

  static USER_PSWD_GQL_QUERY = gql `query login($email: String, $password: String) {
    userProfiles(
      condition: { email: $email, password: $password, active: true }
    ) {
      nodes {
        email
        id
        password
        name
        role
      }
    }
  }`;

  static EMAIL_EXISTS_GQL_QUERY = gql `query emailExists($email: String!) {
    userProfiles(condition: { email: $email }) {
      nodes {
        email
        id
        name
      }
    }
  }`;

  static FP_PROFILE_GQL_MUTATE = gql `mutation profileOTPUpdate(
    $otp: BigInt!
    $otp_expire_time: Datetime
    $id: BigInt!
  ) {
    updateUserProfile(
      input: {
        patch: { otp: $otp, otpExpireTime: $otp_expire_time }
        id: $id
      }
    ) {
      userProfile {
        email
      }
    }
  }`;

  static OTP_VALIDATION_GQL_QUERY = gql `query emailOTPExists($email: String!) {
    userProfiles(condition: { email: $email }) {
      nodes {
        id
        otp
        name
        email
        otpExpireTime
      }
    }
  }`;

  static RESET_PSWD_GQL_MUTATE = gql `mutation changePassword($id: BigInt!, $password: String!) {
    updateUserProfile(input: { patch: { password: $password, otp: null, otpExpireTime: null }, id: $id }) {
      userProfile {
        id
      }
    }
  }`;

  static CHNG_PSWD_USR_GQL_QUERY = gql `query ($id: BigInt!) {
    userProfile(id: $id) {
      password
      name
    }
  }`;

  static CHNG_PSWD_GQL_MUTATE = gql `mutation changePassword($id: BigInt!, $password: String!) {
    updateUserProfile(input: { patch: { password: $password }, id: $id }) {
      userProfile {
        id
      }
    }
  }`;

}

exports.Const = Const;
