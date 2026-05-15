import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf
} from "../services/interview.api"

import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    const { interviewId } = useParams()

    if (!context) {

        throw new Error(
            "useInterview must be used within an InterviewProvider"
        )
    }

    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports
    } = context

    /**
     * Generate Interview Report
     */
    const generateReport = async ({
        resumeFile,
        selfDescription,
        jobDescription
    }) => {

        setLoading(true)

        let response = null

        try {

            response =
                await generateInterviewReport({
                    resumeFile,
                    selfDescription,
                    jobDescription
                })

            setReport(
                response?.interviewReport
            )

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }

        return response?.interviewReport
    }

    /**
     * Get Interview Report By ID
     */
    const getReportById = async (
        interviewId
    ) => {

        setLoading(true)

        let response = null

        try {

            response =
                await getInterviewReportById(
                    interviewId
                )

            setReport(
                response?.interviewReport
            )

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }

        return response?.interviewReport
    }

    /**
     * Get All Interview Reports
     */
    const getReports = async () => {

        setLoading(true)

        let response = null

        try {

            response =
                await getAllInterviewReports()

            setReports(
                response?.interviewReports || []
            )

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }

        return response?.interviewReports
    }

    /**
     * Download Resume PDF
     */
    const getResumePdf = async (
        interviewReportId
    ) => {

        if (!interviewReportId) {

            alert(
                "Interview Report ID not found"
            )

            return
        }

        setLoading(true)

        try {

            // FIXED HERE
            const response =
                await generateResumePdf({
                    interviewReportId
                })

            const url =
                window.URL.createObjectURL(

                    new Blob(
                        [response],
                        {
                            type:
                                "application/pdf"
                        }
                    )
                )

            const link =
                document.createElement("a")

            link.href = url

            link.setAttribute(
                "download",
                `resume_${interviewReportId}.pdf`
            )

            document.body.appendChild(link)

            link.click()

            link.remove()

            window.URL.revokeObjectURL(url)

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }
    }

    /**
     * Auto Fetch Data
     */
    useEffect(() => {

        if (interviewId) {

            getReportById(interviewId)

        } else {

            getReports()
        }

    }, [interviewId])

    return {

        loading,
        report,
        reports,

        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}