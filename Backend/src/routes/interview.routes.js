const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const inetrviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")



const interviewRouter = express.Router()

/**
 * @route POST /api/interview
 * description : Generate new interview report on the basis of resume pdf, self description and job description
 * @access private
 */
interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),inetrviewController.generateInterviewReportController)


/**
 * @route GET /api/interview/report/:interviewId
 * description : Get interview report by interviewId
 * @access private
 */
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,inetrviewController.getInterviewReportByIdController)
 
/**
 * @route GET /api/interview/
 * description : Get all interview reports of logged in user
 * @access private
 */

interviewRouter.get("/",authMiddleware.authUser,inetrviewController.getAllInterviewReportsController)  

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user resume, self description and job description
 * @access private
 */

interviewRouter.post(
   "/resume/pdf/:interviewReportId",
   authMiddleware.authUser,
   inetrviewController.generateResumePdfController
)
module.exports = interviewRouter