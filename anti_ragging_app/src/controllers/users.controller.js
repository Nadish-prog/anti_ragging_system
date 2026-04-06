const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");

exports.searchUsers = async (req, res) => {
  try {
    const { q, roll_no } = req.query;

    if (!q && !roll_no) {
      return res.status(400).json({ message: "Search query required" });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          q ? { full_name: { contains: q, mode: "insensitive" } } : {},
          roll_no ? { roll_no: roll_no } : {},
        ],
        role_id: 1, // assuming 1 = STUDENT
      },
      select: {
        user_id: true,
        full_name: true,
        roll_no: true,
        department_id: true,
        year: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFacultyMembers = async (req, res) => {
  try {
    const { gender } = req.query;

    let whereClause = {
      roles: {
        role_name: "FACULTY",
      },
    };

    if (gender) {
      whereClause.genders = {
        gender_name: gender,
      };
    }

    const faculty = await prisma.users.findMany({
      where: whereClause,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        department_id: true,
        faculty_code: true,
      },
    });

    res.status(200).json({ faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching faculty" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        roles: {
          role_name: {
            in: ["STUDENT", "FACULTY"],
          },
        },
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        roll_no: true,
        faculty_code: true,
        roles: {
          select: {
            role_name: true,
          },
        },
        departments: {
          select: {
            department_name: true,
          },
        },
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.users.update({
      where: {
        user_id: parseInt(id),
      },
      data: {
        password_hash,
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
      }
    });

    res.status(200).json({ 
      message: "Password reset successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};
