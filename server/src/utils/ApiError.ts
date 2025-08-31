export type ErrorResponse = {
  field?: string;
  message: string;
};

export class ApiError extends Error {
  statusCode: number;
  validationErrors: ErrorResponse[];

  constructor(
    statusCode: number,
    validationErrors: ErrorResponse[] = [],
    message: string = "Validation failed"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.name = "ApiError";
  }
}
