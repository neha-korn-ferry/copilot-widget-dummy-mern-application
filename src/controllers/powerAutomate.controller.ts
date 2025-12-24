import { Request, Response } from "express";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
    keepAlive: false,
    rejectUnauthorized: true
});

export const connectPowerAutomate = async (req: Request, res: Response): Promise<void> => {
    try {
        const flowUrl = "https://defaulte9d2138743f14e06a253f9ed9096dc.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a96efb0c5bfd418db345408ee5830796/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=I8hNILxhyN9K4E7F4pjOuHd6KnJ78fMlo_1o153Emp0"
        if (!flowUrl) {
            throw new Error("Power Automate flow URL not configured");
        }

        console.log("Received request to connect to Power Automate:", req.body);

        const participantEmail = req.body.participantEmail;
        const userPrompt = req.body.userPrompt;
        const coachEmail = req.body.coachEmail;

        if (!participantEmail || !userPrompt || !coachEmail) {
            res.status(400).json({ message: "participantEmail, userPrompt and coachEmail are required in the request body" });
            return;
        }

        // const payload = req.body;
        const participantSummary = {
            "participant": {
                "email": "neha.tanwar@kornferry.com",
                "fullName": "Neha Tanwar",
                "currentPosition": "Software Developer",
                "currentCompany": "Ispace Technology",
                "timezone": "America/Los_Angeles",
                "languageCode": "en-US",
                "countryCode": "US"
            },
            "goals": [],
            "linkedInProfileData": "https://www.linkedin.com/in/neha-tanwar-750540356",
            "resumes": {
                "document": null,
                "created": null,
                "wordCount": 0,
                "parsed": true,
                "hasResume": false,
                "error": "No resume found"
            },
            "assessmentReports": {
                "count": 0,
                "documents": [],
                "reportTypes": [],
                "latestDate": null,
                "totalWordCount": 0,
                "filteredBy": [
                    "LearningAgility",
                    "Development-configurable",
                    "KF360",
                    "RiskFactors",
                    "Candidate",
                    "KF4DTraitsAndDrivers"
                ],
                "parsed": true
            },
            "appointments": {
                "total": 0,
                "upcoming": 0,
                "past": 0,
                "nextAppointment": null,
                "recentAppointments": [],
                "byStatus": {
                    "scheduled": 0,
                    "completed": 0,
                    "cancelled": 0
                }
            },
            "onboarding": {
                "status": "expired",
                "phase": "expired",
                "isComplete": false,
                "daysInProgram": 368,
                "programDuration": "12",
                "isExtended": false,
                "coachingStatus": {
                    "hasStarted": true,
                    "isExpired": false,
                    "isExtended": false
                },
                "onboardingQuestionnaires": {
                    "questions": [],
                    "summary": {
                        "totalQuestions": 0,
                        "answeredQuestions": 0
                    }
                },
                "programData": {
                    "mode": "Auto",
                    "startDate": "2024/12/20 14:23 UTC",
                    "duration": "12",
                    "durationMarker": "Registration",
                    "calculatedEndDate": "2025/12/20 14:23 UTC",
                    "actualEndDate": null,
                    "purchaseDate": "2019/09/10 21:45 UTC",
                    "coaching": {
                        "startDate": "2024/12/20 14:23 UTC",
                        "duration": null,
                        "endDate": null,
                        "actualEndDate": null,
                        "isExpired": false,
                        "isExtended": false,
                        "endReason": null
                    },
                    "tracking": {
                        "createdDate": "2024/12/20 14:23 UTC",
                        "lastUpdated": null,
                        "createdBy": "df5430560672a942a2b701a954beecec",
                        "updatedBy": null
                    },
                    "userAdditionalInfo": {
                        "Bio": "I am a Software Engineer at iSpace Technology with a strong passion for building scalable and efficient software solutions. With hands-on experience in full-stack development, I specialize in designing and implementing high-quality web applications that solve real-world problems. At iSpace, I contribute to innovative projects using modern technologies and agile methodologies, constantly aiming to improve performance, security, and user experience.",
                        "Education": "Master of computer application",
                        "YearsExperience": "4",
                        "ReportsTo": "Kalyana",
                        "ReportsToTitle": "Developer",
                        "NeedCd": "careerchange",
                        "NeedTimeline": null,
                        "isTextable": null,
                        "linkedInProfile": "https://www.linkedin.com/in/neha-tanwar-750540356",
                        "city": "New York",
                        "state": "California",
                        "countryCode": "US",
                        "spokenLanguageCode": "en-US"
                    },
                    "accountInfo": {
                        "accountKey": "fdf7bac855509f8faf20dc9d1ff56e24",
                        "accountAddress": "neha.tanwar@kornferry.com",
                        "isVerified": 1,
                        "loginType": "Azure",
                        "emailType": "Work",
                        "isPrimary": 1,
                        "registrationDate": null,
                        "verifiedDate": "2025/11/18 05:34 UTC"
                    }
                }
            },
            "kf360Assessment": {
                "hasAssessment": false,
                "assessments": [],
                "status": {
                    "overall": "NOT_STARTED",
                    "lastEvent": null,
                    "lastUpdated": null
                }
            },
            "summary": {
                "hasResumes": false,
                "hasAssessmentReports": false,
                "hasUpcomingAppointments": false,
                "hasKF360Assessment": false,
                "hasOnboardingData": true,
                "onboardingPhase": "expired",
                "totalDocuments": 0,
                "totalParsedWords": 0,
                "processingTime": "88ms",
                "hasOnboardingQuestionnaires": false,
                "completedOnboardingQuestionnaires": 0
            },
            "recentActivity": {
                "ActivityName": "Customactivity test",
                "ActivityStartDate": "2027-01-10",
                "ActivityEndDate": "2031-11-26",
                "ActivityComments": "Activity custom "
            }
        }

        const payload = {
            participantSummary,
            userPrompt: req.body.userPrompt
        }


        const response = await axios.post(flowUrl, payload, {
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 60000, // 60 seconds
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            proxy: false, 
            httpsAgent
        })

        console.log("Power Automate response:", response.data);

        res.json({ message: "Power Automate flow triggered successfully", data: response.data });
    }
    catch (error) {
        console.error("Error connecting to Power Automate:", error);
        res.status(500).json({ message: "Error connecting to Power Automate", error });
    }
}