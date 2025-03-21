class ApiResponse extends Error {
    constructor(statusCode, data, message = "Success") {
        super()
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
};

export { ApiResponse };