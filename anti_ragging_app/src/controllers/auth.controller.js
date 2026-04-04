const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail, getEmailTemplate } = require("../utils/emailService");

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role_id, department_id, phone_no, roll_no, faculty_code, year } = req.body;

    if (!full_name || !email || !password || !role_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        full_name,
        email,
        password_hash,
        role_id,
        department_id,
        phone_no: phone_no || null,
        roll_no: roll_no || null,
        faculty_code: faculty_code || null,
        year: year ? parseInt(year, 10) : null,
      },
      include: { roles: true }
    });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.roles.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        ...user,
        role: user.roles.role_name
      }
    });

    // Send Welcome Email
    const content = `
      <p style="margin-bottom: 16px;">Dear <strong>${full_name}</strong>,</p>
      <p style="margin-bottom: 16px;">Welcome! Your registration was successful. You can now log in to the system using your email address and password.</p>
      <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; color: #1e40af; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0;">If you have any questions or require assistance, please feel free to contact the administration.</p>
      </div>
    `;

    const htmlContent = getEmailTemplate("Account Registration Successful", content);

    await sendEmail({
      to: email,
      subject: "Welcome to SafeCampus - Registration Successful",
      html: htmlContent,
    });

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error", details: error.message, stack: error.stack });
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.roles.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        ...user,
        role: user.roles.role_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
