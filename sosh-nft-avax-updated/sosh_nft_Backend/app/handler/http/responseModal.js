class ResponseModal {
  constructor() {
    this.statusCode = 200;
    this.status = 'success';
    this.data = '';
    this.message = null;
  }

  setStatusCode(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  getStatusCode() {
    return this.statusCode;
  }

  setStatus(status) {
    this.status = status === 'success' ? 'success' : 'error';
    return this;
  }

  setData(data) {
    this.data = data;
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  getBody() {
    const reponseData = {
      status: this.status,
      message: this.message,
      data: this.data,
    };
    return reponseData;
  }
}

module.exports = ResponseModal;
