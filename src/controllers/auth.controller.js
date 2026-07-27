const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};