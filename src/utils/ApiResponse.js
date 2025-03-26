class ApiResponse {
  constructor(message = "Success", data, statusCode, success) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)
