const prisma = require("../config/prisma");

async function registerUser(data) {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: data.password,
    },
  });

  return user;
}

module.exports = {
  registerUser,
};