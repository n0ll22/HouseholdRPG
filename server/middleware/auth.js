const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ errorMessage: "Unauthorized" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ errorMessage: "Unauthorized" });
  }
}

async function authAdmin(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ errorMessage: "Unauthorized" });

    const { user } = jwt.verify(token, process.env.JWT_SECRET);

    const findUser = await User.findById(user);

    if (!findUser || findUser.isAdmin === false) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ errorMessage: "Unauthorized" });
  }
}
module.exports = { auth, authAdmin };
