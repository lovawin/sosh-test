/**
 * a function to get singular or plural text based on the number
 * @param {number} number - the number to check
 * @param {string} singularText - the singular text
 * @param {boolean} returnNumber - if true, return the number and text, otherwise return the singular text
 * @returns {string} the singular or plural text
 */

export const getCountBasedText = (
  number,
  singularText,
  returnNumber = false
) => {
  if (typeof number === "string") {
    number = parseInt(number) || 0;
  } else if (number === "undefined" || number === null) {
    number = 0;
  }
  if (number > 1) {
    return returnNumber ? `${number} ${singularText}s` : `${singularText}s`;
  }
  return returnNumber ? `${number} ${singularText}` : singularText;
};

/**
 * a function test if string is true or false
 * @param {string} string - the string to test
 * @returns {boolean} true or false
 */

export const isTrue = (string) => {
  if (typeof string === "string") {
    return string.toLowerCase() === "true";
  }
  return false;
};
