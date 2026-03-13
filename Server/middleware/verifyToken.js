// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();
// const SECRET_KEY = process.env.JWT_SECRET || "Malpani@2025";

// export const verifyToken = (req, res, next) => {
//   // Expect Authorization header: "Bearer <token>"
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Au' });
//   }

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }

//     // Attach decoded user info to request
//     req.user = decoded;
//     next();
//   });
// };
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "Malpani@2025";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Authorization header missing
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        code: "AUTH_HEADER_MISSING",
        message: "Authorization header is required.",
      });
    }

    // Validate Bearer format
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        code: "INVALID_AUTH_FORMAT",
        message: "Authorization format must be 'Bearer <token>'.",
      });
    }

    // Verify JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            code: "TOKEN_EXPIRED",
            message: "Authentication token has expired. Please login again.",
          });
        }

        return res.status(403).json({
          success: false,
          code: "INVALID_TOKEN",
          message: "Invalid authentication token.",
        });
      }

      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error("JWT Middleware Error:", error);

    return res.status(500).json({
      success: false,
      code: "TOKEN_VERIFICATION_FAILED",
      message: "Internal server error while verifying authentication token.",
    });
  }
};