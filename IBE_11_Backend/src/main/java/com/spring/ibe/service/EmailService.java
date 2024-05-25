package com.spring.ibe.service;

import com.azure.communication.email.EmailClient;
import com.azure.communication.email.EmailClientBuilder;
import com.azure.communication.email.models.EmailMessage;
import com.azure.communication.email.models.EmailSendResult;
import com.azure.communication.email.models.EmailSendStatus;
import com.azure.core.util.polling.LongRunningOperationStatus;
import com.azure.core.util.polling.PollResponse;
import com.azure.core.util.polling.SyncPoller;
import com.spring.ibe.constants.EmailTemplate;
import com.spring.ibe.dto.request.EmailRequestDTO;
import com.spring.ibe.dto.request.GenerateOtpRequestDTO;
import com.spring.ibe.exception.custom.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service class for handling email-related operations.
 */
@Service
@Slf4j
public class EmailService {
    private final String connectionString;
    private final String senderAddress;

    /**
     * Constructor for initializing the EmailService.
     *
     * @param connectionString The connection string for the email service.
     * @param senderAddress    The sender address for outgoing emails.
     */
    public EmailService(@Value("${app.email_connection_string}") String connectionString,
            @Value("${app.email_sender_address}") String senderAddress) {
        this.connectionString = connectionString;
        this.senderAddress = senderAddress;
    }

    /**
     * Sends an email message using the provided EmailMessage object.
     *
     * @param emailMessage The EmailMessage object containing the email details.
     * @throws CustomException If sending the email fails.
     */
    public void sendEmail(EmailMessage emailMessage) {
        EmailClient client = new EmailClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        try {
            SyncPoller<EmailSendResult, EmailSendResult> poller = client.beginSend(emailMessage, null);

            PollResponse<EmailSendResult> pollResponse = null;

            Duration timeElapsed = Duration.ofSeconds(0);
            Duration POLLER_WAIT_TIME = Duration.ofSeconds(10);

            while (pollResponse == null
                    || pollResponse.getStatus() == LongRunningOperationStatus.NOT_STARTED
                    || pollResponse.getStatus() == LongRunningOperationStatus.IN_PROGRESS) {
                pollResponse = poller.poll();
                log.info("Email send poller status: {}", pollResponse.getStatus());

                Thread.sleep(POLLER_WAIT_TIME.toMillis());
                timeElapsed = timeElapsed.plus(POLLER_WAIT_TIME);

                if (timeElapsed.compareTo(POLLER_WAIT_TIME.multipliedBy(18)) >= 0) {
                    throw new CustomException("Polling timed out.");
                }
            }

            if (poller.getFinalResult().getStatus() == EmailSendStatus.SUCCEEDED) {
                log.info("Successfully sent the email (operation id: {})", poller.getFinalResult().getId());
            } else {
                log.error("Failed to send email: {}", poller.getFinalResult().getError().getMessage());
                throw new CustomException(poller.getFinalResult().getError().getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            throw new CustomException(e.getMessage());
        }
    }

    /**
     * Sends an email message using the provided EmailRequestDTO.
     *
     * @param emailRequestDTO The EmailRequestDTO containing the email details.
     * @throws CustomException If sending the email fails.
     */
    public void sendEmail(EmailRequestDTO emailRequestDTO) {

        String emailSubject = EmailTemplate.getSubject(String.valueOf(emailRequestDTO.getEmailType()));

        String emailBody = EmailTemplate.getBody(emailRequestDTO);

        String emailHtml = EmailTemplate.getHtml(emailRequestDTO);

        EmailMessage message = new EmailMessage()
                .setSenderAddress(senderAddress)
                .setToRecipients(emailRequestDTO.getRecipientAddress())
                .setSubject(emailSubject)
                .setBodyPlainText(emailBody)
                .setBodyHtml(emailHtml);

        sendEmail(message);
    }

    /**
     * Sends an OTP email message.
     *
     * @param generateOtpRequestDTO The GenerateOtpRequestDTO containing the OTP
     *                              details.
     * @param otp                   The OTP to be sent.
     * @throws CustomException If sending the email fails.
     */
    public void sendOtpEmail(GenerateOtpRequestDTO generateOtpRequestDTO, String otp) {
        String emailSubject = "Your One-Time Password (OTP) for booking cancellation";
        String emailBody = "Dear user,\n\nYour One-Time Password (OTP) is: " + otp
                + "\n\nPlease use this OTP to cancel your booking.\n\nThank you!";
        String emailHtml = "<!DOCTYPE html>" +
                "<html lang=\"en\">" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>OTP to Cancel Booking</title>" +
                "</head>" +
                "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 0; color: #000000; \">" +
                "<table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 700px;\">"
                +
                "<tr>" +
                "<td style=\"padding: 20px 0; text-align: center;\">" +
                "<h2 style=\"margin-bottom: 20px; font-size: 28px;\">OTP to Cancel Booking</h2>" +
                "<hr style=\"border-top: 2px solid #ccc;\">" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style=\"padding: 20px 0;\">" +
                "<p>Hi user,</p>" +
                "<p style=\"font-size: 28px; font-weight: bold; margin: 20px 0;\">" + otp + "</p>" +
                "<p style=\" color: #000000; \">is your OTP for cancelling your booking with <strong>Booking ID "
                + generateOtpRequestDTO.getBookingId()
                + "</strong> on IBE Kickdrum platform. This OTP will be valid only for the next 10 minutes.</p>" +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style=\"padding: 20px 0; text-align: left;\">" +
                "<p>Regards,<br>Team IBE Kickdrum</p>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</body>" +
                "</html>";

        EmailMessage message = new EmailMessage()
                .setSenderAddress(senderAddress)
                .setToRecipients(generateOtpRequestDTO.getEmailId())
                .setSubject(emailSubject)
                .setBodyPlainText(emailBody)
                .setBodyHtml(emailHtml);

        sendEmail(message);
    }
}
