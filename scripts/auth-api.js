const authApi = (function() {

  function authenticate(userName, password, callback) {
    let uuid = createUUID();
    storeUuid(uuid);
    sendAuthRequest(userName, password, callback);
  }

  function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    let s = new Array(36);
    let hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    return s.join("");
  }

  function storeUuid(uuid) {
    window.sessionStorage.setItem("nonce", uuid);
    if (app.DEBUG)
      console.log("nonce written to local storage: " + getSessionItem("nonce"));
  }

  function computeHash(data) {
    let hash = sjcl.hash.sha256.hash(data);
    return sjcl.codec.hex.fromBits(hash);
  }

  function sendAuthRequest(userName, password, callback) {
    let uuid = getSessionItem("nonce");
    Vue.http.get(app.API_URL + "/auth", {
      headers: {
        nonce: uuid,
        auth: "true"
      }
    }).then(success => {
      let hash = computeHash(userName + password);
      window.sessionStorage.setItem("passHash", hash);
      if (app.DEBUG)
        console.log("first hash: " + hash);
      hash = computeHash(success.headers.get("nonce") + hash);
      if (app.DEBUG)
        console.log("hash: " + hash);
      auth(uuid, hash, callback);
    }, error => {
      console.error(error);
    });

  }

  function auth(uuid, hash, callback) {
    Vue.http.get(app.API_URL + "/auth", {
      headers: {
        client: uuid,
        hash: hash
      }
    }).then(success => {
      window.sessionStorage.setItem("serverNonce", success.headers.get("nonce"));
      window.sessionStorage.setItem("authenticated", true);
      callback(success, null);
    }, error => {
      window.sessionStorage.setItem("authenticated", false);
      callback(null, error);
    });
  }

  function getSessionItem(key) {
    return window.sessionStorage.getItem(key);
  }

  function adminRequest(url, callback) {
    if (app.DEBUG) {
      console.log("Admin request: " + url);
      console.log("Client uuid: " + getSessionItem("nonce"));
      console.log("serverNonce: " + getSessionItem("serverNonce"));
      console.log("password hash: " + getSessionItem("passHash"));
      console.log("hash: " + computeHash(getSessionItem("serverNonce") + getSessionItem("passHash")));
    }

    Vue.http.get(app.API_URL + url, {
      headers: {
        client: getSessionItem("nonce"),
        hash: computeHash(getSessionItem("serverNonce") + getSessionItem("passHash"))
      }
    }).then(success => {
      window.sessionStorage.setItem("serverNonce", success.headers.get("nonce"));
      callback(success.body);
    }, error => callback(null, error.body));
  }


  return {
    authenticate,
    adminRequest
  };
})();
