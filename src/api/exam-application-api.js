import api from '../api';

/**
 * POST /exam-applications/batch-generate-hall-tickets
 * Assigns rollNo, centreId and isHallTicketGenerated flag to all applicants whose status is APPROVED.
 */
export const batchGenerateHallTickets = async () => {
    const response = await api.post("/exam-applications/batch-generate-hall-tickets");
    return response.data;
};
