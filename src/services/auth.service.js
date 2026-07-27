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
const jwt = require("jsonwebtoken");


exports.login = async (data) => {

    const { email, password } = data;


    // Find user by email
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });


    if (!user) {
        throw new Error("Invalid email or password");
    }


    // Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );


    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }


    // Create JWT token
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );


    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    };
};