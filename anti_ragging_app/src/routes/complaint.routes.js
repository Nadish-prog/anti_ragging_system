const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

const complaintController = require("../controllers/complaint.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

//uploading evidence
router.post("/:id/evidence", requireAuth, requireRole("STUDENT"),
  upload.single("file"), complaintController.uploadEvidence,
);


// student creates complaint
router.post(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  complaintController.createComplaint,
);

router.patch(
  "/:id/assign",
  requireAuth,
  requireRole("ADMIN"),
  complaintController.assignFaculty,
);

router.get("/getAssignedComplaints",requireAuth,requireRole("FACULTY"),
complaintController.getAssignedComplaints);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("ADMIN", "FACULTY"),
  complaintController.rejectComplaint,
);

router.patch(
  "/:id/close",
  requireAuth,
  requireRole("FACULTY"),
  complaintController.closeComplaint
);

router.get(
  "/my-complaints",
  requireAuth,
  requireRole("STUDENT"),
  complaintController.getMyComplaints
);

router.get(
  "/all",
  requireAuth,
  requireRole("ADMIN"),
  complaintController.getAllComplaints
);
//admin view complaint

router.get(
  "/getComplaintById/:id",
  requireAuth,
  requireRole("ADMIN"),
  complaintController.getComplaintById
);

module.exports = router;
