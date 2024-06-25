class ApiError extends Error {
  public status: number;
  public message: string;
  public success: boolean;

  constructor(status: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = status;
    this.success = false;
    this.message = message;

    Error.captureStackTrace(this);
  }
}

export default ApiError;
