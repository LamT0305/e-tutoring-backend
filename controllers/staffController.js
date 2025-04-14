import User from "../models/user.model.js";
import Allocation from "../models/allocation.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../services/emailService.js";

const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const createStaff = async (req, res) => {
  try {
    const { name, dateOfBirth, address, email, password } = req.body;

    if (
      !name?.trim() ||
      !dateOfBirth ||
      !address?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return errorResponse(res, 400, "All fields are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 400, "Email already exists");
    }

    const newUser = await User.create({
      name: name.trim(),
      dateOfBirth,
      address: address.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "staff",
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      user: newUser.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffList = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can access this resource"
      );
    }

    const staffs = await User.find({ role: "staff", isActive: true })
      .select("-password")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      staffs,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const allocateTutors = async (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can allocate tutors"
      );
    }

    const { tutorId, studentIds } = req.body;

    // Validate tutor exists and is active
    const tutor = await User.findOne({
      _id: tutorId,
      role: "tutor",
      isActive: true,
    });
    if (!tutor) {
      return errorResponse(res, 404, "Tutor not found or inactive");
    }

    // Validate all students exist and are active
    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
      isActive: true,
    });
    if (students.length !== studentIds.length) {
      return errorResponse(
        res,
        404,
        "One or more students not found or inactive"
      );
    }

    // Check for existing allocations
    const existingAllocations = await Allocation.find({
      tutor_id: tutorId,
      student_id: { $in: studentIds },
    });
    const allocatedStudentIds = existingAllocations.map((a) => a.student_id);
    const newStudentIds = studentIds.filter(
      (id) => !allocatedStudentIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return errorResponse(
        res,
        400,
        "All students are already allocated to this tutor"
      );
    }

    // Create new allocations
    const allocations = await Allocation.insertMany(
      newStudentIds.map((studentId) => ({
        tutor_id: tutorId,
        student_id: studentId,
      }))
    );

    // Send response immediately
    const populatedAllocations = await Allocation.find({
      _id: { $in: allocations.map((a) => a._id) },
    })
      .populate("tutor_id", "name email")
      .populate("student_id", "name email");

    res.status(200).json({
      success: true,
      message: "Students allocated successfully",
      allocations: populatedAllocations,
    });

    // Handle notifications and emails asynchronously
    try {
      // Create notification for tutor
      await Notification.create({
        recipient: tutorId,
        type: "system",
        title: "New Students Allocated",
        message: `You have been allocated ${newStudentIds.length} new student(s)`,
        relatedTo: { model: "User", id: tutorId },
      });

      // Send email to tutor
      sendEmail(
        tutor.email,
        "New Students Allocated",
        `
              <!DOCTYPE html>
              <html>
              <head>
                  <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background-color: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                      .content { background-color: #fff; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #ddd; border-top: none; }
                      .student-list { margin: 20px 0; }
                      .student-item { padding: 10px; border-bottom: 1px solid #eee; }
                      .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h2>New Students Allocated</h2>
                      </div>
                      <div class="content">
                          <p>Dear ${tutor.name},</p>
                          <p>You have been allocated ${
                            newStudentIds.length
                          } new student(s) to tutor:</p>
                          
                          <div class="student-list">
                              ${students
                                .filter((student) =>
                                  newStudentIds.includes(student._id.toString())
                                )
                                .map(
                                  (student) => `
                                  <div class="student-item">
                                      <strong>${student.name}</strong><br>
                                      Email: ${student.email}<br>

                                  </div>
                                `
                                )
                                .join("")}
                          </div>
                          
                          <p>Please contact your students to arrange your first session.</p>
                          <div class="footer">
                              <p>This is an automated message from E-Tutoring System</p>
                          </div>
                      </div>
                  </div>
              </body>
              </html>
              `
      ).catch((e) => console.error("Tutor email failed:", e));

      // Process students
      const newStudents = students.filter((s) =>
        newStudentIds.includes(s._id.toString())
      );

      await Promise.all([
        // Create notifications for students
        ...newStudents.map((student) =>
          Notification.create({
            recipient: student._id,
            type: "system",
            title: "Tutor Allocated",
            message: `You have been allocated to tutor ${tutor.name}`,
            relatedTo: { model: "User", id: tutor._id },
          })
        ),
        // Send emails to students
        ...newStudents.map((student) =>
          sendEmail(
            student.email,
            "Tutor Allocated",
            `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #fff; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #ddd; border-top: none; }
                    .tutor-info { background-color: #f5f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Tutor Allocation Confirmation</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${student.name},</p>
                        <p>We're pleased to inform you that you've been assigned a tutor:</p>
                        
                        <div class="tutor-info">
                            <h3>Your Tutor Details</h3>
                            <p><strong>Name:</strong> ${tutor.name}</p>
                            <p><strong>Email:</strong> ${tutor.email}</p>
                            
                        </div>
                        
                        <p>Your tutor will contact you shortly to schedule your first session.</p>
                        <p>If you have any questions, please don't hesitate to contact our support team.</p>
                        
                        <div class="footer">
                            <p>This is an automated message from E-Tutoring System</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
          ).catch((e) =>
            console.error(`Student ${student.email} email failed:`, e)
          )
        ),
      ]);
    } catch (asyncError) {
      console.error("Async notification/email error:", asyncError);
    }
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllocations = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can view allocations"
      );
    }

    const allocations = await Allocation.find()
      .populate("tutor_id", "name email")
      .populate("student_id", "name email")
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      allocations,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can delete allocations"
      );
    }

    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return errorResponse(res, 404, "Allocation not found");
    }

    await allocation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Allocation deleted successfully",
      allocation,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return errorResponse(
        res,
        403,
        "Access denied. Only staff can perform this action"
      );
    }

    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
    });

    if (!staff) {
      return errorResponse(res, 404, "Staff not found");
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff ${
        staff.isActive ? "activated" : "deactivated"
      } successfully`,
      staff: staff.getProfile(),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
