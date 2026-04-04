const prisma = require("../utils/prismaClient");
const supabase = require("../utils/supabaseClient");
const { sendEmail, getEmailTemplate } = require("../utils/emailService");
//student create complaint
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      incident_type_id,
      location,
      incident_date,
      parties_involved, // Renamed from accused for clarity on the frontend
      is_anonymous,
    } = req.body;


    
    //  validation
    if (!title || !description || !incident_type_id) {
      return res.status(400).json({
        message: "Title, description and incident type are required",
      });
    }

    const OPEN_STATUS_ID = 1; // assuming OPEN = 1

    const result = await prisma.$transaction(async (tx) => {
      // Create complaint
      const complaint = await tx.complaints.create({
        data: {
          title,
          description,
          incident_type_id,
          location: location || null,
          incident_date: incident_date ? new Date(incident_date) : null,
          student_id: req.user.user_id,
          status_id: OPEN_STATUS_ID,
          is_anonymous: is_anonymous || false,
        },
      });

      // Insert accused (if provided)
      if (Array.isArray(parties_involved) && parties_involved.length > 0) {
        for (const person of parties_involved) {
          if (!person.accused_name) continue; // Skip empty names
          
          await tx.complaint_accused.create({
            data: {
              complaint_id: complaint.complaint_id,
              accused_name: person.accused_name,
            },
          });
        }
      }

      //  Create audit log
      await tx.complaint_logs.create({
        data: {
          complaint_id: complaint.complaint_id,
          action_by_user_id: req.user.user_id,
          action_description: is_anonymous
            ? "Anonymous complaint created"
            : "Complaint created",
        },
      });

      return complaint;
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: result,
    });

    if (true) {
      const student = await prisma.users.findUnique({
        where: { user_id: req.user.user_id },
        select: { email: true, full_name: true }
      });
      
      const content = `
        <p style="margin-bottom: 16px;">Dear <strong>${student.full_name}</strong>,</p>
        <p style="margin-bottom: 16px;">This email is to confirm that we have successfully received your complaint titled "<strong>${title}</strong>".</p>
        <p style="margin-bottom: 16px;">The Anti-Ragging Committee will review it shortly. You will be notified when a faculty member starts investigating the case.</p>
      `;
      
      const htmlContent = getEmailTemplate("Complaint Received", content);
      
      await sendEmail({
        to: student.email,
        subject: "SafeCampus - Complaint Received",
        html: htmlContent
      });
    }

  } catch (error) {
    console.error("Create Complaint Error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
//student upload evidence
exports.uploadEvidence = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Fetch complaint with status
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
      include: { complaint_status: true },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ownership check
    if (complaint.student_id !== req.user.user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Status check
    const allowedStatuses = ["OPEN", "INVESTIGATING"];

    if (!allowedStatuses.includes(complaint.complaint_status.status_name)) {
      return res.status(400).json({
        message: "Cannot upload evidence for closed or rejected complaints",
      });
    }

    const fileName = `complaint-${complaintId}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("complaint-evidence")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/complaint-evidence/${fileName}`;

    await prisma.evidence.create({
      data: {
        complaint_id: complaintId,
        file_url: publicUrl,
        file_type: file.mimetype,
      },
    });

    res.status(201).json({
      message: "Evidence uploaded successfully",
      file_url: publicUrl,
    });
  } catch (error) {
    console.error("Upload Evidence Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//admin assign faculty
exports.assignFaculty = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { faculty_id, severity_id } = req.body;

    if (!faculty_id) {
      return res.status(400).json({ message: "Faculty ID required" });
    }

    // Fetch complaint with status and student details
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
      include: { 
        complaint_status: true,
        users_complaints_student_idTousers: {
          select: { email: true, full_name: true }
        }
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure complaint is OPEN
    if (complaint.complaint_status.status_name !== "OPEN") {
      return res.status(400).json({
        message: "Only OPEN complaints can be assigned",
      });
    }

    // Prevent reassignment
    if (complaint.assigned_faculty_id) {
      return res.status(400).json({
        message: "Complaint is already assigned to a faculty",
      });
    }

    // Validate faculty
    const faculty = await prisma.users.findUnique({
      where: { user_id: faculty_id },
      include: { roles: true },
    });

    if (!faculty || faculty.roles.role_name !== "FACULTY") {
      return res.status(400).json({ message: "Invalid faculty user" });
    }

    // Get INVESTIGATING status
    const investigatingStatus = await prisma.complaint_status.findFirst({
      where: { status_name: "INVESTIGATING" },
    });

    if (!investigatingStatus) {
      return res.status(500).json({
        message: "INVESTIGATING status not configured",
      });
    }

    let updateData = {
      assigned_faculty_id: faculty_id,
      status_id: investigatingStatus.status_id,
      updated_at: new Date(),
    };
    if (severity_id) {
      updateData.severity_id = parseInt(severity_id);
    }

    // Transaction (Update + Log)
    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaints.update({
        where: { complaint_id: complaintId },
        data: updateData,
      });

      await tx.complaint_logs.create({
        data: {
          complaint_id: complaintId,
          action_by_user_id: req.user.user_id,
          action_description: `Assigned to faculty: ${faculty.full_name}`,
        },
      });

      return updated;
    });

    res.status(200).json({
      message: "Faculty assigned successfully",
      complaint: updatedComplaint,
    });

    if (complaint.users_complaints_student_idTousers) {
      const studentEmail = complaint.users_complaints_student_idTousers.email;
      const studentName = complaint.users_complaints_student_idTousers.full_name;
      
      const content = `
        <p style="margin-bottom: 16px;">Dear <strong>${studentName}</strong>,</p>
        <p style="margin-bottom: 16px;">Your complaint titled "<strong>${updatedComplaint.title}</strong>" is now under investigation.</p>
        <div style="background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #334155;"><strong>Assigned Faculty:</strong> ${faculty.full_name}</p>
        </div>
      `;
      
      const htmlContent = getEmailTemplate("Investigation Started", content);
      
      await sendEmail({
        to: studentEmail,
        subject: "SafeCampus - Complaint Investigation Started",
        html: htmlContent
      });
    }

  } catch (error) {
    console.error("Assign Faculty Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//faculty get assigned complaints
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaints.findMany({
      where: {
        assigned_faculty_id: req.user.user_id,
      },
      include: {
        // Correct relation name for student details
        users_complaints_student_idTousers: {
          select: {
            full_name: true,
            roll_no: true,
            phone_no: true,
            email: true,
            year: true,
            department_id: true,
          },
        },
        // Include accused details
        complaint_accused: true,
        evidence: true,
        complaint_status: true,
        severity_levels: true,
        incident_types: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formatted = complaints.map((c) => {
      // Logic to resolve accused name
      const formattedAccused = c.complaint_accused.map((acc) => ({
        accused_id: acc.accused_id,
        name: acc.accused_name,
      }));

      return {
        complaint_id: c.complaint_id,
        title: c.title,
        description: c.description,
        location: c.location,
        incident_date: c.incident_date,
        status: c.complaint_status?.status_name,
        severity: c.severity_levels?.level_name,
        incident_type: c.incident_types?.type_name,
        is_anonymous: c.is_anonymous,
        final_remark: c.final_remark,
        created_at: c.created_at,

        // Hide student details if anonymous
        student_info: c.is_anonymous
          ? null
          : {
              full_name: c.users_complaints_student_idTousers?.full_name,
              roll_no: c.users_complaints_student_idTousers?.roll_no,
              year: c.users_complaints_student_idTousers?.year,
              department_id: c.users_complaints_student_idTousers?.department_id,
              phone_no: c.users_complaints_student_idTousers?.phone_no,
              email: c.users_complaints_student_idTousers?.email,
            },

        accused: formattedAccused,
        evidence: c.evidence,
      };
    });

    res.status(200).json({ complaints: formatted });
  } catch (error) {
    console.error("Fetch Assigned Complaints Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
//admin reject complaint
exports.rejectComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { reason, severity_id } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    // Check complaint exists and include student details
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
      include: { 
        complaint_status: true,
        users_complaints_student_idTousers: {
          select: { email: true, full_name: true }
        }
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure complaint is OPEN or INVESTIGATING
    if (complaint.complaint_status.status_name !== "OPEN" && complaint.complaint_status.status_name !== "INVESTIGATING") {
      return res.status(400).json({
        message: "Only OPEN or INVESTIGATING complaints can be rejected",
      });
    }

    // Role-specific authorization
    if (req.user.role === "FACULTY" && complaint.assigned_faculty_id !== req.user.user_id) {
      return res.status(403).json({ message: "Not authorized to reject this complaint" });
    }

    // Get REJECTED status ID
    const rejectedStatus = await prisma.complaint_status.findFirst({
      where: { status_name: "REJECTED" },
    });

    if (!rejectedStatus) {
      return res.status(500).json({ message: "REJECTED status not configured" });
    }
    
    let updateData = {
      status_id: rejectedStatus.status_id,
      final_remark: reason,
      updated_at: new Date(),
    };
    if (severity_id) {
      updateData.severity_id = parseInt(severity_id);
    }

    // Transaction for safety
    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaints.update({
        where: { complaint_id: complaintId },
        data: updateData,
      });

      await tx.complaint_logs.create({
        data: {
          complaint_id: complaintId,
          action_by_user_id: req.user.user_id,
          action_description: `Complaint rejected: ${reason}`,
        },
      });

      return updated;
    });

    res.status(200).json({
      message: "Complaint rejected successfully",
      complaint: updatedComplaint,
    });

    if (complaint.users_complaints_student_idTousers) {
      const studentEmail = complaint.users_complaints_student_idTousers.email;
      const studentName = complaint.users_complaints_student_idTousers.full_name;
      
      const content = `
        <p style="margin-bottom: 16px;">Dear <strong>${studentName}</strong>,</p>
        <p style="margin-bottom: 16px;">Your complaint titled "<strong>${updatedComplaint.title}</strong>" has been reviewed and rejected.</p>
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; color: #991b1b; border-radius: 4px; margin-top: 20px; margin-bottom: 20px;">
          <p style="margin: 0;"><strong>Reason provided by administration:</strong><br/>${reason}</p>
        </div>
        <p style="margin-top: 20px;">If you believe this is an error, please contact the administrative office.</p>
      `;
      
      const htmlContent = getEmailTemplate("Complaint Update: Rejected", content);
      
      await sendEmail({
        to: studentEmail,
        subject: "SafeCampus - Complaint Update",
        html: htmlContent
      });
    }

  } catch (error) {
    console.error("Reject Complaint Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//faculty close complaint
exports.closeComplaint = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);
    const { final_remark } = req.body;

    if (!final_remark || final_remark.trim() === "") {
      return res.status(400).json({ message: "Final remarks are required to close a complaint" });
    }

    // Fetch complaint with status and student info
    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
      include: { 
        complaint_status: true,
        users_complaints_student_idTousers: {
          select: { email: true, full_name: true }
        }
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Ensure complaint is assigned to this faculty
    if (complaint.assigned_faculty_id !== req.user.user_id) {
      return res.status(403).json({
        message: "You are not authorized to close this complaint",
      });
    }

    // Ensure complaint is in INVESTIGATING state
    if (complaint.complaint_status.status_name !== "INVESTIGATING") {
      return res.status(400).json({
        message: "Only INVESTIGATING complaints can be closed",
      });
    }

    // Get CLOSED status
    const closedStatus = await prisma.complaint_status.findFirst({
      where: { status_name: "CLOSED" },
    });

    if (!closedStatus) {
      return res.status(500).json({
        message: "CLOSED status not configured",
      });
    }

    // Transaction
    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const updated = await tx.complaints.update({
        where: { complaint_id: complaintId },
        data: {
          status_id: closedStatus.status_id,
          final_remark: final_remark || "Resolved internally by assigned faculty.",
          updated_at: new Date(),
        },
      });

      await tx.complaint_logs.create({
        data: {
          complaint_id: complaintId,
          action_by_user_id: req.user.user_id,
          action_description: `Complaint closed${final_remark ? `: ${final_remark}` : ''}`,
        },
      });

      return updated;
    });

    res.status(200).json({
      message: "Complaint closed successfully",
      complaint: updatedComplaint,
    });

    if (complaint.users_complaints_student_idTousers) {
      const studentEmail = complaint.users_complaints_student_idTousers.email;
      const studentName = complaint.users_complaints_student_idTousers.full_name;
      
      const content = `
        <p style="margin-bottom: 16px;">Dear <strong>${studentName}</strong>,</p>
        <p style="margin-bottom: 16px;">Your complaint titled "<strong>${updatedComplaint.title}</strong>" has been investigated and marked as resolved.</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; color: #166534; border-radius: 4px; margin-top: 20px; margin-bottom: 20px;">
          <p style="margin: 0;"><strong>Final Remarks:</strong><br/>${updatedComplaint.final_remark}</p>
        </div>
        <p>Thank you for helping us maintain a safe campus environment.</p>
      `;
      
      const htmlContent = getEmailTemplate("Complaint Resolved", content);
      
      await sendEmail({
        to: studentEmail,
        subject: "SafeCampus - Complaint Resolved",
        html: htmlContent
      });
    }

  } catch (error) {
    console.error("Close Complaint Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//student get my complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const studentId = req.user.user_id;

    const complaints = await prisma.complaints.findMany({
      where: {
        student_id: studentId,
      },
      include: {
        complaint_status: true,
        severity_levels: true,
        evidence: true,
        incident_types: true,
        complaint_accused: true,
        users_complaints_assigned_faculty_idTousers: {
          select: {
            full_name: true,
            email: true,
            phone_no: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formatted = complaints.map((c) => {
      const formattedAccused = c.complaint_accused.map((acc) => ({
        accused_id: acc.accused_id,
        name: acc.accused_name,
      }));

      return {
        complaint_id: c.complaint_id,
        title: c.title,
        description: c.description,
        location: c.location,
        incident_date: c.incident_date,
        status: c.complaint_status?.status_name,
        severity: c.severity_levels?.level_name,
        incident_type: c.incident_types?.type_name,
        is_anonymous: c.is_anonymous,
        final_remark: c.final_remark,
        created_at: c.created_at,
        accused: formattedAccused,
        evidence: c.evidence.map((e) => ({
          evidence_id: e.evidence_id,
          file_url: e.file_url,
          file_type: e.file_type,
          uploaded_at: e.uploaded_at,
        })),
        assigned_faculty: c.users_complaints_assigned_faculty_idTousers ? {
          name: c.users_complaints_assigned_faculty_idTousers.full_name,
          email: c.users_complaints_assigned_faculty_idTousers.email,
          phone_no: c.users_complaints_assigned_faculty_idTousers.phone_no,
        } : null,
      };
    });

    return res.status(200).json({
      complaints: formatted,
    });
  } catch (error) {
    console.error("Get My Complaints Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//student get my complaint by id
exports.getMyComplaintById = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const complaintId = parseInt(req.params.id);

    const complaint = await prisma.complaints.findFirst({
      where: {
        complaint_id: complaintId,
        student_id: studentId,
      },
      include: {
        complaint_status: true,
        severity_levels: true,
        incident_types: true,
        complaint_accused: true,
        evidence: true,
        users_complaints_assigned_faculty_idTousers: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone_no: true,
          },
        },
        complaint_logs: {
          orderBy: {
            timestamp: "asc",
          },
          select: {
            log_id: true,
            action_description: true,
            timestamp: true,
            action_by_user_id: true,
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found or not authorized" });
    }

    return res.status(200).json({ complaint });
  } catch (error) {
    console.error("Get My Complaint By ID Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//admin get all complaints with filters 
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, severity } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.complaint_status = {
        status_name: status.toUpperCase(),
      };
    }

    if (severity) {
      whereClause.severity_levels = {
        level_name: severity.toUpperCase(),
      };
    }

    const complaints = await prisma.complaints.findMany({
      where: whereClause,
      select: {
        complaint_id: true,
        title: true,
        location: true,
        created_at: true,
        is_anonymous: true,

        complaint_status: {
          select: {
            status_name: true,
          },
        },

        severity_levels: {
          select: {
            level_name: true,
          },
        },

        incident_types: {
          select: {
            type_name: true,
          },
        },

        users_complaints_student_idTousers: {
          select: {
            user_id: true,
            full_name: true,
            roll_no: true,
            year: true,
          },
        },

        users_complaints_assigned_faculty_idTousers: {
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({ complaints });
  } catch (error) {
    console.error("Admin Get Complaints Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
//admin get complaint by id 
exports.getComplaintById = async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id);

    const complaint = await prisma.complaints.findUnique({
      where: { complaint_id: complaintId },
      include: {
        complaint_status: true,
        severity_levels: true,
        incident_types: true,

        users_complaints_student_idTousers: {
          select: {
            user_id: true,
            full_name: true,
            roll_no: true,
            year: true,
            department_id: true,
            phone_no: true,
            email: true,
          },
        },

        users_complaints_assigned_faculty_idTousers: {
          select: {
            user_id: true,
            full_name: true,
            faculty_code: true,
            department_id: true,
            email: true,
          },
        },

        complaint_accused: true,

        evidence: true,

        complaint_logs: {
          orderBy: {
            timestamp: "asc",
          },
          select: {
            log_id: true,
            action_description: true,
            timestamp: true,
            action_by_user_id: true,
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({ complaint });
  } catch (error) {
    console.error("Get Complaint By ID Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


