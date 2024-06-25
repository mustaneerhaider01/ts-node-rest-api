class ApiError extends Error {
    constructor(status, message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.status = status;
        this.success = false;
        this.message = message;
        Error.captureStackTrace(this);
    }
}
export default ApiError;
