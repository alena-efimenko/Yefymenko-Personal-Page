let hexDigits = "0123456789abcdef";
let uuidLength = 36;

function createUUID() {
  // http://www.ietf.org/rfc/rfc4122.txt
  let s = new Array(uuidLength);
  for (let i = 0; i < uuidLength; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}

function isUUID(s) {
  if (s.length !== uuidLength)
    return false;
  if (s[8] != "-" || s[13] != "-" || s[18] != "-" || s[23] != "-")
    return false;
  let toLower = s.toLowerCase();
  return validLetters(0, 8) &&
    validLetters(14, 18) &&
    validLetters(19, 23) &&
    validLetters(24, uuidLength);

  function validLetters(start, end) {
    for (let i = start; i < end; ++i) {
      if (hexDigits.indexOf(toLower[i]) == -1)
        return false;
    }
    return true;
  }
}

module.exports = {
  createUUID,
  isUUID
}
