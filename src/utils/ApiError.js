class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], statck = '') {
        super(message)
        this.data = null
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.success = false

    }
}