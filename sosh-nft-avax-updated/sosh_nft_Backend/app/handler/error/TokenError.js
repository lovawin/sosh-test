class TokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenError';
    this.status = 400;
    this.code = 'token_invalid';
  }
}

module.exports = {
  TokenError,
};
