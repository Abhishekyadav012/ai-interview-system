const pdf = require("pdf-parse/lib/pdf-parse")

const {
    generateInterviewReport,
    generateResumePdf
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Generate interview report
 */
async function generateInterviewReportController(req, res) {

    try {

        // check resume file
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            });
        }

        // extract pdf text
        const data = await pdf(req.file.buffer);

        const resumeContent = data.text;

        const { selfDescription, jobDescription } = req.body;

        // validation
        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        console.log("Generating interview report...");

        // AI report
        const interviewReportByAi =
            await generateInterviewReport({
                resume: resumeContent,
                selfDescription,
                jobDescription
            });

        // AI failed
        if (!interviewReportByAi) {
            return res.status(500).json({
                message: "Failed to generate interview report"
            });
        }

        console.log("Interview report generated successfully");

        // save in database
        const interviewReport =
            await interviewReportModel.create({
                user: req.user._id,
                resume: resumeContent,
                selfDescription,
                jobDescription,
                ...interviewReportByAi
            });

        res.status(200).json({
            message: "Interview report generated successfully",
            interviewReport
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

/**
 * @description Get interview report by ID
 */
async function getInterviewReportByIdController(req, res) {

    try {

        const { interviewId } = req.params;

        const interviewReport =
            await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user._id
            });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

/**
 * @description Get all interview reports
 */
async function getAllInterviewReportsController(req, res) {

    try {

        const interviewReports =
            await interviewReportModel
                .find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .select(
                    "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
                );

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

/**
 * @description Generate resume PDF
 */
async function generateResumePdfController(req, res) {

    try {

        const { interviewReportId } = req.params;

        const interviewReport =
            await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        const {
            resume,
            selfDescription,
            jobDescription
        } = interviewReport;

        const pdfBuffer = await generateResumePdf({
            resume,
            selfDescription,
            jobDescription
        });

        if (!pdfBuffer) {
            return res.status(500).json({
                message: "Failed to generate PDF"
            });
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};