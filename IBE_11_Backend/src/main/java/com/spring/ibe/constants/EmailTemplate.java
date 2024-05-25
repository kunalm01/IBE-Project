package com.spring.ibe.constants;

import com.spring.ibe.dto.request.EmailRequestDTO;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

public class EmailTemplate {

    private EmailTemplate() {
    }

    static String imageUrl = "https://team11ibestorageaccount.blob.core.windows.net/ibe-team11-blob-storage/email-thank-you-image.jpeg";

    /**
     * Retrieves the subject line for the email based on the email type.
     *
     * @param emailType The type of the email.
     * @return The subject line for the email.
     */
    public static String getSubject(String emailType) {
        if (Objects.equals(emailType, "CONFIRMATION")) {
            return "Your Booking Confirmation and Details";
        } else if (Objects.equals(emailType, "REVIEW")) {
            return "Share Your Experience: Leave a Review";
        }
        return null;
    }

    /**
     * Generates the HTML content for the email based on the email request DTO.
     *
     * @param emailRequestDTO The email request DTO containing the email type.
     * @return The HTML content for the email.
     */
    public static String getHtml(EmailRequestDTO emailRequestDTO) {
        if (Objects.equals(String.valueOf(emailRequestDTO.getEmailType()), "CONFIRMATION")) {
            return getBookingConfirmationHtml(emailRequestDTO);
        } else if (Objects.equals(String.valueOf(emailRequestDTO.getEmailType()), "REVIEW")) {
            return getBookingReviewHtml(emailRequestDTO);
        }
        return null;
    }

    /**
     * Generates the body content for the email based on the email request DTO.
     *
     * @param emailRequestDTO The email request DTO containing the email type.
     * @return The body content for the email.
     */
    public static String getBody(EmailRequestDTO emailRequestDTO) {
        if (Objects.equals(String.valueOf(emailRequestDTO.getEmailType()), "CONFIRMATION")) {
            return getBookingConfirmationBody(emailRequestDTO);
        } else if (Objects.equals(String.valueOf(emailRequestDTO.getEmailType()), "REVIEW")) {
            return getBookingReviewBody(emailRequestDTO);
        }
        return null;
    }

    private static String getBookingConfirmationBody(EmailRequestDTO emailRequestDTO) {
        return "Dear " + emailRequestDTO.getFirstName() + " " + emailRequestDTO.getLastName() + ",\n\n" +
                "Thank you for choosing our services. Below are your booking details:\n" +
                "Room Type: " + emailRequestDTO.getBookingDetails().getRoomType() + "\n" +
                "Room Count: " + emailRequestDTO.getBookingDetails().getRoomCount() + "\n" +
                "Start Date: " + emailRequestDTO.getBookingDetails().getStartDate() + "\n" +
                "End Date: " + emailRequestDTO.getBookingDetails().getEndDate() + "\n\n" +
                "We hope you enjoyed your recent experience with us. " +
                "Thank you for choosing our services!\n\nBest regards,\nInternet Booking Engine Team";
    }

    private static String getBookingReviewBody(EmailRequestDTO emailRequestDTO) {
        return "Hello, " + emailRequestDTO.getFirstName() + "!\n\n" +
                "Thank you for choosing IBE Kickdrum hotel for your recent stay in the city. It was a pleasure to have you as our guest. We would like to take this opportunity to thank you for your collaboration, and we hope to see you again soon at the hotel.\n\n"
                +
                "We want to note that we constantly conduct work on the improvement of the quality of service, and we will be very grateful if you leave your opinion. Your remarks will help us to choose the right direction.\n\n"
                +
                "Your opinion is important to us!\n\n" +
                "Leave a review: https://delightful-beach-0ccf2090f.5.azurestaticapps.net/review?tenantId="
                + emailRequestDTO.getTenantId() + "&roomTypeId=" + emailRequestDTO.getRoomTypeId() + "\n\n" +
                "You are receiving this email because you have visited our site or asked us about the regular newsletter. If you wish to unsubscribe from our newsletter, click here.";
    }

    private static String getBookingConfirmationHtml(EmailRequestDTO emailRequestDTO) {
        return "<html dir=\"ltr\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n"
                +
                "\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta content=\"width=device-  width, initial-scale=1\" name=\"viewport\">\n" +
                "    <meta name=\"x-apple-disable-message-reformatting\">\n" +
                "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
                "    <meta content=\"telephone=no\" name=\"format-detection\">\n" +
                "    <title></title>\n" +
                "    <link href=\"https://fonts.googleapis.com/css2?family=Jost&display=swap\" rel=\"stylesheet\">\n" +
                "</head>\n" +
                "\n" +
                "<body>\n" +
                "    <div dir=\"ltr\" class=\"es-wrapper-color\">\n" +
                "        <table class=\"es-wrapper\" width=\"100%\" cellspacing=\"0\" bgcolor=\"#daeafc\" cellpadding=\"0\">\n"
                +
                "            <tbody>\n" +
                "                <tr>\n" +
                "                    <td class=\"esd-email-paddings\" valign=\"top\">\n" +
                "                        <table class=\"esd-header-popover es-header\" cellspacing=\"0\" bgcolor=\"#daeafc\" cellpadding=\"0\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" align=\"center\">\n" +
                "                                        <table class=\"es-header-body\" width=\"700\" bgcolor=\"#daeafc\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"background-color: #daeafc;\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p40t es-p20b es-p40r es-p40l\" align=\"left\" esd-custom-block-id=\"1047512\">\n"
                +
                "                                                        <table class=\"es-left\" cellspacing=\"0\" bgcolor=\"#daeafc\" cellpadding=\"0\" align=\"left\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"es-m-p0r es-m-p20b esd-container-frame\" width=\"324\" valign=\"top\" align=\"center\">\n"
                +
                "                                                                        <table width=\"100%\" bgcolor=\"#daeafc\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"left\" class=\"esd-block-image\" style=\"font-size: 0px;\"><a target=\"_blank\" href=\"https://delightful-beach-0ccf2090f.5.azurestaticapps.net/\"><img src=\"https://team11ibestorageaccount.blob.core.windows.net/ibe-team11-blob-storage/tenant-header-logo.png\" alt=\"Logo\" style=\"display: block;\" height=\"75\" title=\"Logo\"></a></td>\n"
                +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                        <table class=\"es-right\" cellspacing=\"0\" bgcolor=\"#daeafc\" cellpadding=\"0\" align=\"right\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"esd-container-frame\" width=\"216\" align=\"left\">\n"
                +
                "                                                                        <table width=\"100%\" bgcolor=\"#daeafc\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"right\" class=\"esd-block-text es-m-txt-l\">\n"
                +
                "                                                                                        <h2>BOOKING CONFIRMED</h2>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"right\" class=\"esd-block-text es-m-txt-l es-p5t\">\n"
                +
                "                                                                                            <p><strong>"
                + getFormattedDate() + "</strong></p>\n" +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p20r es-p20l\" align=\"left\">\n"
                +
                "                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td width=\"100%\" class=\"esd-container-frame\" align=\"center\" valign=\"top\">\n"
                +
                "                                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-spacer es-p5t es-p5b\" style=\"font-size:0\">\n"
                +
                "                                                                                        <table border=\"0\" bgcolor=\"#daeafc\" width=\"100%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n"
                +
                "                                                                                            <tbody>\n"
                +
                "                                                                                                <tr>\n"
                +
                "                                                                                                    <td style=\"border-bottom: 1px solid #3a0bc7; background: unset; height: 1px; width: 100%; margin: 0px;\"></td>\n"
                +
                "                                                                                                </tr>\n"
                +
                "                                                                                            </tbody>\n"
                +
                "                                                                                        </table>\n" +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                        <table class=\"es-content\" bgcolor=\"#daeafc\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" align=\"center\">\n" +
                "                                        <table class=\"es-content-body\" bgcolor=\"#daeafc\" width=\"700\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"background-color: #daeafc; background-image: url(https://tlr.stripocdn.email/content/guids/CABINET_e18e8b6ad0d2f530731f1cc3bd27d47df9d75aa833914e627ec524bf07cda11b/images/14731345_rm222mind20_1_5nq.png); background-repeat: no-repeat; background-position: right bottom;\" background=\"https://tlr.stripocdn.email/content/guids/CABINET_e18e8b6ad0d2f530731f1cc3bd27d47df9d75aa833914e627ec524bf07cda11b/images/14731345_rm222mind20_1_5nq.png\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p30t es-p20b es-p20r es-p20l\" align=\"left\" esd-custom-block-id=\"1047513\">\n"
                +
                "                                                        <table cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"#daeafc\" align=\"left\" class=\"es-left\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"es-m-p0r es-m-p20b esd-container-frame\" width=\"448\" valign=\"top\" align=\"center\">\n"
                +
                "                                                                        <table width=\"100%\" cellspacing=\"0\" bgcolor=\"#daeafc\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"left\" class=\"esd-block-text\">\n"
                +
                "                                                                                        <h1>Internet Booking Engine Kickdrum</h1>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"left\" class=\"esd-block-text es-p25t es-p40b es-m-p40r\">\n"
                +
                "                                                                                        <h3>Dear "
                + emailRequestDTO.getFirstName() + " " + emailRequestDTO.getLastName() + ",</h3>\n" +
                "                                                                                        <p>We hope you're doing well. We appreciate your business and would like to provide you with the details of the booking recently completed.</p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                        <!--[if mso]></td><td width=\"20\"></td><td width=\"92\" valign=\"top\"><![endif]-->\n"
                +
                "                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" class=\"es-right\" align=\"right\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr class=\"es-mobile-hidden\">\n" +
                "                                                                    <td width=\"92\" align=\"left\" class=\"esd-container-frame\">\n"
                +
                "                                                                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-spacer\" height=\"40\"></td>\n"
                +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                        <img src=\"" + imageUrl
                + "\" alt=\"Thank You Image\" style=\"display: block; margin: 0 auto;\" width=\"700\">\n" +
                "                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" class=\"es-content\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" align=\"center\">\n" +
                "                                        <table bgcolor=\"#daeafc\" class=\"es-content-body\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" width=\"700\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p30t es-p20r es-p20l\" align=\"left\" esd-custom-block-id=\"1047515\">\n"
                +
                "                                                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td width=\"700\" class=\"esd-container-frame\" align=\"center\" valign=\"top\">\n"
                +
                "                                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                               <tr>\n" +
                "                                                                                   <td class=\"esd-structure es-p30t es-p20r es-p20l\" align=\"left\" esd-custom-block-id=\"1047515\">\n"
                +
                "                                                                                       <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                                                           <tbody>\n" +
                "                                                                                               <tr>\n"
                +
                "                                                                                                   <td width=\"700\" class=\"esd-container-frame\" align=\"center\" valign=\"top\">\n"
                +
                "                                                                                                       <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                                                                           <tbody>\n"
                +
                "                                                                                                               <tr>\n"
                +
                "                                                                                                                   <td align=\"left\" class=\"esd-block-text\">\n"
                +
                "                                                                                                                   <h2>BOOKING DETAILS</h2>\n"
                +
                "                                                                                                                   </td>\n"
                +
                "                                                                                                               </tr>\n"
                +
                "                                                                                                               <tr>\n"
                +
                "                                                                                                                   <td align=\"left\" class=\"esd-block-text es-p10b\">\n"
                +
                "                                                                                                                       <table cellpadding=\"15\" cellspacing=\"5\" border=\"2\" style=\"border-collapse: collapse;\">\n"
                +
                "                                                                                                                           <tbody>\n"
                +
                "                                                                                                                               <tr>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Name:</strong>&nbsp;&nbsp;&nbsp;&nbsp;</td>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;"
                + emailRequestDTO.getFirstName() + " " + emailRequestDTO.getLastName()
                + "&nbsp;&nbsp;&nbsp;&nbsp;</td>\n" +
                "                                                                                                                               </tr>\n"
                +
                "                                                                                                                               <tr>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Room Type:</strong>&nbsp;&nbsp;&nbsp;&nbsp;</td>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;"
                + emailRequestDTO.getBookingDetails().getRoomType() + "&nbsp;&nbsp;&nbsp;&nbsp;</td>\n" +
                "                                                                                                                               </tr>\n"
                +
                "                                                                                                                               <tr>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Number of Rooms Booked:</strong>&nbsp;&nbsp;&nbsp;&nbsp;</td>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;"
                + emailRequestDTO.getBookingDetails().getRoomCount() + "&nbsp;&nbsp;&nbsp;&nbsp;</td>\n" +
                "                                                                                                                               </tr>\n"
                +
                "                                                                                                                               <tr>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date of Arrival:</strong>&nbsp;&nbsp;&nbsp;&nbsp;</td>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;"
                + emailRequestDTO.getBookingDetails().getStartDate() + "&nbsp;&nbsp;&nbsp;&nbsp;</td>\n" +
                "                                                                                                                               </tr>\n"
                +
                "                                                                                                                               <tr>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Date of Departure:</strong>&nbsp;&nbsp;&nbsp;&nbsp;</td>\n"
                +
                "                                                                                                                                   <td>&nbsp;&nbsp;&nbsp;&nbsp;"
                + emailRequestDTO.getBookingDetails().getEndDate() + "&nbsp;&nbsp;&nbsp;&nbsp;</td>\n" +
                "                                                                                                                               </tr>\n"
                +
                "                                                                                                                           </tbody>\n"
                +
                "                                                                                                                       </table>\n"
                +
                "                                                                                                                   </td>\n"
                +
                "                                                                                                               </tr>\n"
                +
                "                                                                                                           </tbody>\n"
                +
                "                                                                                                       </table>\n"
                +
                "                                                                                                   </td>\n"
                +
                "                                                                                               </tr>\n"
                +
                "                                                                                           </tbody>\n"
                +
                "                                                                                       </table>\n" +
                "                                                                                   </td>\n" +
                "                                                                               </tr>\n" +
                "                                                                           </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p20r es-p20l es-p15t es-p15b\" align=\"left\">\n"
                +
                "                                                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td width=\"560\" class=\"esd-container-frame es-p15t es-p15b\" align=\"center\" valign=\"top\">\n"
                +
                "                                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-spacer es-p15t es-p15b\" style=\"font-size:0\">\n"
                +
                "                                                                                        <table border=\"0\" bgcolor=\"#daeafc\" width=\"100%\" height=\"100%\" cellpadding=\"0\" cellspacing=\"0\">\n"
                +
                "                                                                                            <tbody>\n"
                +
                "                                                                                                <tr>\n"
                +
                "                                                                                                    <td style=\"border-bottom: 1px solid #3a0bc7; background: unset; height: 20px; width: 100%; margin: 5px;\"></td>\n"
                +
                "                                                                                                </tr>\n"
                +
                "                                                                                            </tbody>\n"
                +
                "                                                                                        </table>\n" +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" class=\"es-footer esd-footer-popover\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" align=\"center\" esd-custom-block-id=\"1029105\">\n"
                +
                "                                        <table class=\"es-footer-body\" width=\"700\" bgcolor=\"#daeafc\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"#ffffff\" align=\"center\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p30t es-p30b es-p20r es-p20l\" align=\"left\" esd-custom-block-id=\"1047520\">\n"
                +
                "                                                        <table cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#daeafc\" width=\"100%\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td width=\"560\" align=\"left\" class=\"esd-container-frame\">\n"
                +
                "                                                                        <table cellpadding=\"0\" bgcolor=\"#daeafc\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-text es-m-txt-c\">\n"
                +
                "                                                                                        <p><em>To unsubscribe from updates, click <a href=\"https://delightful-beach-0ccf2090f.5.azurestaticapps.net/\" target=\"_new\">here</a>.</em>&nbsp; &nbsp;&nbsp;</p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                    </td>\n" +
                "                </tr>\n" +
                "            </tbody>\n" +
                "        </table>\n" +
                "    </div>\n" +
                "</body>\n" +
                "\n" +
                "</html>";
    }

    private static String getBookingReviewHtml(EmailRequestDTO emailRequestDTO) {
        return "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"
                +
                "<html dir=\"ltr\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n"
                +
                "\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta content=\"width=device-width, initial-scale=1\" name=\"viewport\">\n" +
                "    <meta name=\"x-apple-disable-message-reformatting\">\n" +
                "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
                "    <meta content=\"telephone=no\" name=\"format-detection\">\n" +
                "    <title></title>\n" +
                "</head>\n" +
                "\n" +
                "<body>\n" +
                "    <div dir=\"ltr\" class=\"es-wrapper-color\">\n" +
                "        <table class=\"es-wrapper\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n" +
                "            <tbody>\n" +
                "                <tr>\n" +
                "                    <td class=\"esd-email-paddings\" valign=\"top\">\n" +
                "                        <table class=\"es-content esd-header-popover\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" align=\"center\">\n" +
                "                                        <table class=\"es-content-body\" style=\"background-color: #ffffff;\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" bgcolor=\"#ffffff\" align=\"center\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure\" align=\"left\">\n" +
                "                                                        <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td width=\"600\" class=\"esd-container-frame\" align=\"center\" valign=\"top\">\n"
                +
                "                                                                        <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-image\" style=\"font-size:0\"><a target=\"_blank\">\n"
                +
                "                                                                                            <div style=\"overflow: hidden; height: 700px;\"><img class=\"adapt-img\" src=\""
                + imageUrl + "\" alt style=\"display: block; margin-top: -200px; \"></div>\n" +
                "                                                                                        </a></td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure es-p40t es-p40b es-p40r es-p40l\" esd-general-paddings-checked=\"false\" align=\"left\">\n"
                +
                "                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"esd-container-frame\" width=\"520\" valign=\"top\" align=\"center\">\n"
                +
                "                                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-text es-m-txt-c\" align=\"left\">\n"
                +
                "                                                                                        <h1 style=\"color: #333333; line-height: 150%;\">Hello, "
                + emailRequestDTO.getFirstName() + "!</h1>\n" +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-text es-m-txt-c\" align=\"left\">\n"
                +
                "                                                                                        <p style=\"color: #666666; line-height: 150%;\">Thank you for choosing IBE Kickdrum hotel for your recent stay in the city. It was a pleasure to have you as our guest. We would like to take this opportunity to thank you for your collaboration and we hope to see you again soon at the hotel.</p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-text es-m-txt-c es-p10t\" align=\"left\">\n"
                +
                "                                                                                        <p style=\"color: #666666;\">We want to note that we constantly conduct work on improvement of quality of service, and we will be very grateful if you leave the opinion. Your remarks will help us to choose a right direction.</p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-text es-m-txt-c es-p10t\" align=\"left\">\n"
                +
                "                                                                                        <h3 style=\"color: #333333; line-height: 150%;\">Your opinion&nbsp;is&nbsp;important&nbsp;to us!</h3>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-button es-p20t\" align=\"left\"><span class=\"es-button-border\" style=\"border-radius: 0px; border-width: 3px; border-color: #b58a60;\"><a href=\"https://delightful-beach-0ccf2090f.5.azurestaticapps.net/review?tenantId="
                + emailRequestDTO.getTenantId() + "&roomTypeId=" + emailRequestDTO.getRoomTypeId()
                + "\" class=\"es-button\" target=\"_blank\" style=\"border-radius: 0px; font-style: italic; font-family: georgia,times,'times new roman',serif; font-size: 16px; color: #b58a60; padding: 5px 15px\">Leave a review</a></span></td>\n"
                +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                        <table cellpadding=\"0\" cellspacing=\"0\" class=\"es-footer esd-footer-popover\" align=\"center\">\n"
                +
                "                            <tbody>\n" +
                "                                <tr>\n" +
                "                                    <td class=\"esd-stripe\" esd-custom-block-id=\"2915\" align=\"center\">\n"
                +
                "                                        <table class=\"es-footer-body\" width=\"1025\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\">\n"
                +
                "                                            <tbody>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure\" esd-general-paddings-checked=\"true\" align=\"left\">\n"
                +
                "                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"esd-container-frame\" width=\"600\" valign=\"top\" align=\"center\">\n"
                +
                "                                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-social\" align=\"center\" style=\"font-size:0\">\n"
                +
                "                                                                                        <table class=\"es-table-not-adapt es-social\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                                            <tbody>\n"
                +
                "                                                                                                <tr>\n"
                +
                "                                                                                                    <td class=\"es-p10r\" valign=\"top\" align=\"center\"><a target=\"_blank\" href><img title=\"Twitter\" src=\"https://tlr.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png\" alt=\"Tw\" width=\"24\" height=\"24\"></a></td>\n"
                +
                "                                                                                                    <td class=\"es-p10r\" valign=\"top\" align=\"center\"><a target=\"_blank\" href><img title=\"Facebook\" src=\"https://tlr.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png\" alt=\"Fb\" width=\"24\" height=\"24\"></a></td>\n"
                +
                "                                                                                                    <td class=\"es-p10r\" valign=\"top\" align=\"center\"><a target=\"_blank\" href><img title=\"Youtube\" src=\"https://tlr.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png\" alt=\"Yt\" width=\"24\" height=\"24\"></a></td>\n"
                +
                "                                                                                                    <td valign=\"top\" align=\"center\"><a target=\"_blank\" href><img title=\"Vkontakte\" src=\"https://tlr.stripocdn.email/content/assets/img/social-icons/logo-black/vk-logo-black.png\" alt=\"Vk\" width=\"24\" height=\"24\"></a></td>\n"
                +
                "                                                                                                </tr>\n"
                +
                "                                                                                            </tbody>\n"
                +
                "                                                                                        </table>\n" +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td align=\"center\" class=\"esd-block-text es-p15t es-p20b es-p15r es-p15l\">\n"
                +
                "                                                                                        <p style=\"font-size: 13px; line-height: 150%;\">You are receiving this email because you have visited our site or asked us about regular newsletter.&nbsp;If you wish to unsubscribe from our newsletter, click <a class=\"unsubscribe\" target=\"_blank\" style=\"font-size: 13px;\">here</a>.</p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                                <tr>\n" +
                "                                                    <td class=\"esd-structure\" esd-general-paddings-checked=\"true\" style=\"background-color: #80572b;\" bgcolor=\"#80572b\" align=\"left\">\n"
                +
                "                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                            <tbody>\n" +
                "                                                                <tr>\n" +
                "                                                                    <td class=\"esd-container-frame\" width=\"600\" valign=\"top\" align=\"center\">\n"
                +
                "                                                                        <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">\n"
                +
                "                                                                            <tbody>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-image\" align=\"center\" style=\"font-size:0\"><a target=\"_blank\"><img src=\"https://tlr.stripocdn.email/content/guids/CABINET_c3aa6803686f8361447088d544a5e1f7/images/96221507104192901.png\" alt width=\"41\"></a></td>\n"
                +
                "                                                                                </tr>\n" +
                "                                                                                <tr>\n" +
                "                                                                                    <td class=\"esd-block-text es-p10t es-p15b\" esdev-links-color=\"#f4eade\" align=\"center\">\n"
                +
                "                                                                                        <p style=\"color: #ffffff;\">Kickdrum © |&nbsp;<a target=\"_blank\" style=\"color: #f4eade;\" >Privacy policy</a></p>\n"
                +
                "                                                                                    </td>\n" +
                "                                                                                </tr>\n" +
                "                                                                            </tbody>\n" +
                "                                                                        </table>\n" +
                "                                                                    </td>\n" +
                "                                                                </tr>\n" +
                "                                                            </tbody>\n" +
                "                                                        </table>\n" +
                "                                                    </td>\n" +
                "                                                </tr>\n" +
                "                                            </tbody>\n" +
                "                                        </table>\n" +
                "                                    </td>\n" +
                "                                </tr>\n" +
                "                            </tbody>\n" +
                "                        </table>\n" +
                "                    </td>\n" +
                "                </tr>\n" +
                "            </tbody>\n" +
                "        </table>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private static String getFormattedDate() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        return today.format(formatter);
    }
}
