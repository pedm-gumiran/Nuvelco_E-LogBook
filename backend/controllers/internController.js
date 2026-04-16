const Intern = require("../models/internModel");

/* GET ALL INTERNS */
exports.getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.getAllInterns();
    res.status(200).json({ success: true, data: interns });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch interns" });
  }
};

/* GET SINGLE INTERN */
exports.getInternById = async (req, res) => {
  try {
    const intern = await Intern.getInternById(req.params.id);
    if (!intern) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }
    res.status(200).json({ success: true, data: intern });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch intern" });
  }
};

/* CREATE INTERN */
exports.createIntern = async (req, res) => {
  try {
    const {
      id,
      firstName,
      middleInitial,
      lastName,
      suffix,
      schoolId,
      courseId,
    } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({
          success: false,
          message: "First name and last name are required",
        });
    }

    // Check for duplicate intern with same first and last name
    const isDuplicate = await Intern.checkDuplicateByName(firstName, lastName);
    if (isDuplicate) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An intern with this name already exists",
        });
    }

    // Use provided intern ID or generate new one
    let internId = id;
    if (!internId) {
      // Generate random alphanumeric intern ID (e.g., I8X2K9M1)
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const length = 8;
      internId = "I";
      for (let i = 0; i < length - 1; i++) {
        internId += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
    }

    await Intern.createIntern(
      internId,
      firstName,
      middleInitial,
      lastName,
      suffix,
      schoolId,
      courseId,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Intern created successfully",
        data: { id: internId },
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create intern" });
  }
};

/* UPDATE INTERN */
exports.updateIntern = async (req, res) => {
  try {
    const { firstName, middleInitial, lastName, suffix, schoolId, courseId } =
      req.body;
    const id = req.params.id;

    // Check for duplicate intern with same first and last name (excluding current record)
    const isDuplicate = await Intern.checkDuplicateByNameExcludingId(
      firstName,
      lastName,
      id,
    );
    if (isDuplicate) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An intern with this name already exists",
        });
    }

    const affectedRows = await Intern.updateIntern(
      id,
      firstName,
      middleInitial,
      lastName,
      suffix,
      schoolId,
      courseId,
    );

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Intern updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update intern" });
  }
};

/* DELETE INTERN */
exports.deleteIntern = async (req, res) => {
  try {
    const affectedRows = await Intern.deleteIntern(req.params.id);

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Intern not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Intern deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete intern" });
  }
};
