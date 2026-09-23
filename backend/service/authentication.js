import jwt from "jsonwebtoken";

const createTokenForUser = (user) => {
  const payload = {
    _id: user._id,
    userId: user.userId,
    email: user.email,
    companyId: user.companyId,
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};


const validateToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};


export {
  createTokenForUser,
  validateToken,
};