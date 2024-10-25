// // import CustomError from '../utils/customError.js'
// import { Prisma, PrismaClient } from "@prisma/client";
// import { PrismaClientValidationError } from "@prisma/client/runtime/library";
// import { StatusCodes } from "http-status-codes";

// class CustomError extends Error {
//   code: StatusCodes;

//   constructor(message: string, code: StatusCodes) {
//     super(message);
//     this.message = message;
//     this.code = code;
//     Object.setPrototypeOf(this, CustomError.prototype);
//   }
// }

// const handlePrismaError = (err: PrismaClientValidationError) => {
//   switch (err.code) {
//     case "P2002":
//       // handling duplicate key errors
//       return new CustomError(`Duplicate field value: ${err.meta.target}`, 400);
//     case "P2014":
//       // handling invalid id errors
//       return new CustomError(`Invalid ID: ${err.meta.target}`, 400);
//     case "P2003":
//       // handling invalid data errors
//       return new CustomError(`Invalid input data: ${err.meta.target}`, 400);
//     default:
//       // handling all other errors
//       return new CustomError(`Something went wrong: ${err.message}`, 500);
//   }
// };

// const handleJWTError = () =>
//   new CustomError("Invalid token please login again", 400);

// const handleJWTExpiredError = () =>
//   new CustomError("Token has expired please login again", 400);

// const sendErrorDev = (err, req, res) => {
//   if (req.originalUrl.startsWith("/api")) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       errors: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   } else {
//     //rendered website
//     res
//       .status(err.statusCode)
//       .render("error", { title: "Something went wrong!", msg: err.message });
//   }
// };

// const sendErrorProd = (err, req, res) => {
//   if (req.originalUrl.startsWith("/api")) {
//     if (err.isOperational)
//       return res
//         .status(err.statusCode)
//         .json({ status: err.status, message: err.message });

//     //programming errors dont leak details
//     console.error("ERROR 💥", err);

//     return res
//       .status(400)
//       .json({ status: " error", message: "Please try again later" });
//   }

//   //for rendered website
//   if (err.isOperational)
//     return res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   //programming errors should not leak details to client

//   return res
//     .status(500)
//     .json({ status: " error", message: "Sommething went wrong" });
// };

// const errorHandler = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500; //default status code for an error
//   err.status = err.status || "error"; //default status
//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };

//     error.message = err.message;
//     if (err instanceof Prisma.PrismaClientKnownRequestError) {
//       console.log("handlePrismaError");
//       error = handlePrismaError(err);
//     } else if (error.name === "JsonWebTokenError") {
//       error = handleJWTError();
//     } else if (error.name === "TokenExpiredError") {
//       error = handleJWTExpiredError();
//     }
//     sendErrorProd(error, req, res);
//   }
// };

// export default errorHandler;
