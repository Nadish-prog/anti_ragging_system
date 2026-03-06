const prisma = require("../utils/prismaClient");

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
    const faculty = await prisma.users.findMany({
      where: {
        roles: {
          role_name: "FACULTY",
        },
      },
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
