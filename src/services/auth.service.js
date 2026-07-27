const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

exports.register = async (data) => {

    const { username, email, password } = data;


    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });


    if (existingUser) {
        throw new Error("Username or email already exists");
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create user
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword
        }
    });


    return user;
};