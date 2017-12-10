const uuid = require('./uuid');
const fs = require('fs');
const crypto = require('crypto');

let requestCache = {};
let authUser = {};
let expiredAfter = 1000 * 60 * 60; // one hour
let passHash = "79e08a0747af56b6e808b6fcf5ca9c75537eca14da97988423833fe7361858a4";

function createAuthRequest(clientUUID, callback) {
  if (!clientUUID)
    callback(new Error("Invalid Request. Empty client UUID"));
  if (!uuid.isUUID(clientUUID))
    callback(new Error("Invalid Request. Invalid client UUID: " + clientUUID));
  if (requestCache.hasOwnProperty(clientUUID))
    callback(new Error("Invalid Request. Already requested for UUID: " + clientUUID));
  let serverNonce = uuid.createUUID();

  requestCache.clientUUID = {
    serverNonce,
    requested: Date.now()
  };
  callback(null, serverNonce);
}

function authRequest(clientUUID, hash, callback) {
  console.log("Client uuid: " + clientUUID);
  console.log("Client hash: " + hash);
  if (!clientUUID || !hash) {
    callback(new Error("Invalid auth request"));
    return;
  }
  if (clientRequestExpired(clientUUID)) {
    callback(new Error("The client request expired for uuid: " + clientUUID));
    return;
  }
  let isAuthenticated = compareRequestHashes(clientUUID, hash);
  if (isAuthenticated) {
    authUser.user = {
      clientUUID,
      serverNonce: uuid.createUUID()
    }
    callback(null, authUser.user.serverNonce);
  } else
    callback(new Error("Wrong user name/password"));
}

function compareRequestHashes(clientUUID, hash) {
  let serverUUID = requestCache.clientUUID.serverNonce;
  let serverHash = computeHash(serverUUID + passHash);
  console.log("Server hash: " + serverHash);
  return serverHash == hash;
}

function computeHash(data) {
  let stream = crypto.createHash("sha256");
  stream.update(data);
  return stream.digest("hex");
}

function authAdminRequest(clientUUID, hash, callback) {
  console.log("Admin: Client uuid :" + clientUUID);
  if (!authUser.user) {
    callback(new Error("Invalid request"));
    return;
  }
  if (authUser.user.clientUUID != clientUUID) {
    console.log("Admin: Allowed Client uuid :" + authUser.user.clientUUID);
    callback(new Error("Not allowed"));
    return;
  }
  console.log("Admin: Client hash: " + hash);
  console.log("Admin: Server nonce: " + authUser.user.serverNonce);

  let serverHash = computeHash(authUser.user.serverNonce + passHash);
  console.log("Admin: Server hash: " + serverHash);

  if (serverHash != hash) {
    callback(new Error("Invalid request"));
    return;
  }
  authUser.user.serverNonce = uuid.createUUID();
  return callback(null, authUser.user.serverNonce);
}

function clientRequestExpired(clientUUID) {
  if (!requestCache.clientUUID)
    return true;
  return Date.now() - requestCache.clientUUID.requested > expiredAfter;
}

module.exports = {
  createAuthRequest,
  authAdminRequest,
  authRequest
}
