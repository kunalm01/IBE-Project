import { useEffect, useRef, useState } from "react";
import "./BookingPage.scss";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "@mui/material";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { monitorPageView } from "../../utils/ga";

interface BookingResponseDTO {
  bookingId: number;
  active: boolean;
  startDate: string;
  endDate: string;
  roomCount: number;
  adultCount: number;
  teenCount: number;
  seniorCount: number;
  kidCount: number;
  roomName: string;
  roomImageUrl: string;
  totalCost: number;
  amountDueAtResort: number;
  nightlyRate: number;
  taxes: number;
  vat: number;
  promotionTitle: string;
  priceFactor: number;
  promotionDescription: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  hasSubscribed: boolean;
  firstNameBilling: string;
  lastNameBilling: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  phoneBilling: string;
  emailBilling: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
}

export function BookingPage() {
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const appState = useSelector((state: RootState) => state.app);
  const currency = appState.currency;
  const rates = appState.rate;
  const locale = appState.locale;
  const idToken = appState.idToken;
  const loggedInEmail = appState.loggedInEmail;
  const selectedItinerary = checkoutPageState.selectedItinerary;
  const tenantId = appState.configData.tenant_id;
  const [activeMenus, setActiveMenus] = useState<number[]>([1]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(
    false
  );
  const [reload, setReload] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookingResponseDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement | null>(null);

  const handleMenuClick = (menuNo: number) => {
    if (activeMenus.includes(menuNo)) {
      setActiveMenus([]);
    } else {
      setActiveMenus([menuNo]);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => pdfRef.current,
    documentTitle: "Booking invoice",
  });

  const handleClose = () => {
    setShowModal(false);
    setShowConfirmationModal(false);
  };

  const handleCancelBooking = () => {
    cancelBooking();
    setShowConfirmationModal(false);
  };

  const handleCancel = () => {
    if (loggedInEmail) {
      const email = bookingData?.email;
      if (email === loggedInEmail) {
        setShowConfirmationModal(true);
      } else {
        sendOTP();
        setShowModal(true);
      }
    } else {
      sendOTP();
      setShowModal(true);
    }
    setReload(false);
  };

  const cancelBooking = async () => {
    const response = await fetch(
      `https://team-11-ibe-apim.azure-api.net/api/v1/cancel-booking/${bookingId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token: idToken as string,
        },
      }
    );
    if (response.ok) {
      setReload(true);
      reduxDispatch(
        showSnackbar({
          message: "Booking cancelled successfully!",
          type: "success",
        })
      );
    } else {
      reduxDispatch(
        showSnackbar({
          message: "Booking cancellation failed, please try again.",
          type: "error",
        })
      );
    }
  };

  const checkBooking = async () => {
    const response = await fetch(
      `https://team-11-ibe-apim.azure-api.net/api/v1/check-booking`
    );
    if (response.ok) {
      setReload(true);
      reduxDispatch(
        showSnackbar({
          message: "Booking cancelled successfully!",
          type: "success",
        })
      );
    } else {
      reduxDispatch(
        showSnackbar({
          message: "Booking cancellation failed, please try again.",
          type: "error",
        })
      );
    }
  };

  const sendOTP = async () => {
    reduxDispatch(
      showSnackbar({
        message: "Otp sent to email registered with booking",
        type: "success",
      })
    );
    const response = await fetch(
      "https://team-11-ibe-apim.azure-api.net/api/v1/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingData?.bookingId,
          emailId: bookingData?.email,
        }),
      }
    );
    if (!response.ok) {
      reduxDispatch(
        showSnackbar({
          message: "Error sending Otp. Please check again or try later.",
          type: "error",
        })
      );
    }
  };

  const verifyOtp = async () => {
    const response = await fetch(
      "https://team-11-ibe-apim.azure-api.net/api/v1/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingData?.bookingId,
          otp,
        }),
      }
    );
    const data = await response.json();

    if (data.message.includes("verified")) {
      reduxDispatch(
        showSnackbar({
          message: "OTP verified successfully",
          type: "success",
        })
      );
      checkBooking();
      setShowModal(false);
    } else {
      reduxDispatch(
        showSnackbar({
          message: "Invalid OTP. Please verify again.",
          type: "error",
        })
      );
    }
  };

  const handleEmail = () => {
    reduxDispatch(
      showSnackbar({
        message: "Email sent successfully to registered email-id!",
        type: "success",
      })
    );
    try {
      fetch(`https://team-11-ibe-apim.azure-api.net/api/v1/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          roomTypeId: selectedItinerary?.room.roomTypeId,
          recipientAddress: bookingData?.email,
          firstName: bookingData?.firstName,
          lastName: bookingData?.lastName,
          bookingDetails: {
            roomType: bookingData?.roomName,
            roomCount: bookingData?.roomCount,
            startDate: bookingData?.startDate,
            endDate: bookingData?.endDate,
          },
          emailType: "CONFIRMATION",
        }),
      });
    } catch (error) {
      reduxDispatch(
        showSnackbar({
          message: "Error sending email. Please check again or try later.",
          type: "error",
        })
      );
    }
  };

  const handleReview = () => {
    navigate(`/review?bookingId=${bookingData?.bookingId}`);
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");

  useEffect(() => {
    monitorPageView("/booking", "Booking Page");
  }, []);

  useEffect(() => {
    const fetchBookingData = async () => {
      setIsLoading(true);
      const response = await fetch(
        `https://team-11-ibe-apim.azure-api.net/api/v1/booking/${bookingId}`
      );
      if (!response.ok) {
        setBookingData(null);
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setBookingData(data);
      setIsLoading(false);
    };
    if (bookingId !== null) {
      fetchBookingData();
    }
  }, [bookingId, reload]);

  const formattedStartDate = formatDate(bookingData?.startDate ?? "").split(
    " "
  );
  const formattedEndDate = formatDate(bookingData?.endDate ?? "").split(" ");
  let displayStartDate = formattedStartDate[1].substring(
    0,
    formattedStartDate[1].length - 1
  );
  if (displayStartDate.startsWith("0")) {
    displayStartDate = displayStartDate.substring(1);
  }
  let displayEndDate = formattedEndDate[1].substring(
    0,
    formattedEndDate[1].length - 1
  );
  if (displayEndDate.startsWith("0")) {
    displayEndDate = displayEndDate.substring(1);
  }

  let adultsTitle = "";
  let teensTitle = "";
  let kidsTitle = "";
  let seniorCitizensTitle = "";

  if (bookingData) {
    if (locale === "en") {
      adultsTitle = bookingData.adultCount > 1 ? "Adults" : "Adult";
      teensTitle = bookingData.teenCount > 1 ? "Teens" : "Teen";
      kidsTitle = bookingData.kidCount > 1 ? "Kids" : "Kid";
      seniorCitizensTitle =
        bookingData.seniorCount > 1 ? "Senior Citizens" : "Senior Citizen";
    } else if (locale === "es") {
      adultsTitle = bookingData.adultCount > 1 ? "Adultos" : "Adulto";
      teensTitle = bookingData.teenCount > 1 ? "Adolescentes" : "Adolescente";
      kidsTitle = bookingData.kidCount > 1 ? "Niños" : "Niño";
      seniorCitizensTitle =
        bookingData.seniorCount > 1 ? "Personas Mayores" : "Persona Mayor";
    }
  }

  const currentDate = new Date();
  const startDate = bookingData && new Date(bookingData.startDate);
  const endDate = bookingData && new Date(bookingData.endDate);
  const isUpcoming =
    bookingData?.active && startDate && startDate > currentDate;
  const isOngoing =
    bookingData?.active &&
    startDate &&
    endDate &&
    currentDate >= startDate &&
    currentDate <= endDate;
  const isSuccessful =
    bookingData &&
    startDate &&
    endDate &&
    bookingData.active &&
    endDate < currentDate &&
    currentDate > startDate;

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "90vh",
        alignItems: "center",
      }}
    >
      <ClipLoader
        color="black"
        loading={isLoading}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
        className="loader"
      />
    </div>
  ) : bookingData ? (
    <div className="booking-page-container" ref={pdfRef}>
      <div className="booking-options">
        <span className="title">
          {isUpcoming ? (
            <FormattedMessage
              id="upcoming"
              defaultMessage="Upcoming reservation"
            />
          ) : isOngoing ? (
            <FormattedMessage
              id="ongoing"
              defaultMessage="Ongoing reservation"
            />
          ) : isSuccessful ? (
            <FormattedMessage
              id="successful"
              defaultMessage="Successful reservation"
            />
          ) : (
            <FormattedMessage
              id="cancelled"
              defaultMessage="Cancelled reservation"
            />
          )}{" "}
          #{bookingData.bookingId}
        </span>
        {bookingData.active && (
          <div className="buttons-container">
            <button
              className="print-btn"
              onClick={async () => {
                await setActiveMenus([1, 2, 3, 4]);
                handlePrint();
                await setActiveMenus([1]);
              }}
            >
              <FormattedMessage id="print" defaultMessage="Print" />
            </button>
            <button className="email-btn" onClick={handleEmail}>
              <FormattedMessage id="emailTitle" defaultMessage="Email" />
            </button>
          </div>
        )}
      </div>
      <div className="booking-container">
        <div className="booking-info-container">
          <div className="booking-title">
            <div className="room-guest-info">
              <span className="room-title">
                <FormattedMessage id="roomTitle" defaultMessage="Room" />:{" "}
                <FormattedMessage
                  id={bookingData.roomName.toLowerCase()}
                  defaultMessage={bookingData.roomName}
                />{" "}
                x {bookingData.roomCount}
              </span>
              <div className="guests-info">
                <img src="/icons/user.png" alt="user" />
                <span className="guests">
                  {bookingData.adultCount} {adultsTitle}
                  {bookingData.teenCount > 0 &&
                    `, ${bookingData.teenCount} ${teensTitle}`}
                  {bookingData.kidCount > 0 &&
                    `, ${bookingData.kidCount} ${kidsTitle}`}
                  {bookingData.seniorCount > 0 &&
                    `, ${bookingData.seniorCount} ${seniorCitizensTitle}`}
                </span>
              </div>
            </div>
            {isUpcoming ? (
              <button className="cancel-btn" onClick={handleCancel}>
                <FormattedMessage id="cancel" defaultMessage="Cancel Room" />
              </button>
            ) : (
              !isOngoing &&
              bookingData.active && (
                <button className="cancel-btn" onClick={handleReview}>
                  <FormattedMessage id="rate" defaultMessage="Leave a Review" />
                </button>
              )
            )}
          </div>
          <div className="booking-info">
            <img src={bookingData.roomImageUrl} alt="room-pic" />
            <div className="date-promo-info">
              <div className="date-info">
                <div className="date-div">
                  <span className="title">
                    <FormattedMessage id="checkIn" defaultMessage="Check in" />
                  </span>
                  <span className="date">{displayStartDate}</span>
                  <span className="month">
                    {formattedStartDate[0]} {formattedStartDate[2]}
                  </span>
                </div>
                <div className="date-div">
                  <span className="title">
                    <FormattedMessage
                      id="checkOut"
                      defaultMessage="Check out"
                    />
                  </span>
                  <span className="date">{displayEndDate}</span>
                  <span className="month">
                    {formattedEndDate[0]} {formattedEndDate[2]}
                  </span>
                </div>
              </div>
              {bookingData.promotionTitle.length > 0 && (
                <div className="promo-info">
                  <span className="title">
                    {}{" "}
                    <FormattedMessage
                      id={bookingData.promotionTitle.toLowerCase()}
                      defaultMessage={bookingData.promotionTitle}
                    />
                  </span>
                  <span className="description">
                    <FormattedMessage
                      id={`${bookingData.promotionTitle.toLowerCase()} description`}
                      defaultMessage={bookingData.promotionDescription}
                    />
                  </span>
                </div>
              )}
              <div className="subtotal-info">
                <span className="title">
                  <FormattedMessage
                    id="copy"
                    defaultMessage="Copy explaining the cancellation policy, if applicable"
                  />
                </span>
                <span className="subtotal">
                  <IntlProvider locale="en">
                    <FormattedNumber
                      style="currency"
                      currency={currency}
                      value={bookingData.nightlyRate * rates[currency]}
                      maximumFractionDigits={2}
                    />
                  </IntlProvider>
                  /<FormattedMessage id="night" defaultMessage="night" /> total
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdowns-container">
          <div className="dropdown-wrapper">
            <div className="dropdown-title" onClick={() => handleMenuClick(1)}>
              <img
                src={`/icons/arrow-${
                  activeMenus.includes(1) ? "up" : "down"
                }-large.png`}
                alt="arrow-down"
              />
              <span className="title">
                {" "}
                <FormattedMessage
                  id="roomTotal"
                  defaultMessage="Room Total"
                />{" "}
                <FormattedMessage id="summary" defaultMessage="Summary" />
              </span>
            </div>
            {activeMenus.includes(1) && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="ratepernight"
                      defaultMessage="Nightly rate"
                    />
                  </span>
                  <span className="price">
                    <IntlProvider locale="en">
                      <FormattedNumber
                        style="currency"
                        currency={currency}
                        value={bookingData.nightlyRate * rates[currency]}
                        maximumFractionDigits={2}
                      />
                    </IntlProvider>
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="subtotalTitle"
                      defaultMessage="Subtotal"
                    />
                  </span>
                  <span className="price">
                    <IntlProvider locale="en">
                      <FormattedNumber
                        style="currency"
                        currency={currency}
                        value={bookingData.totalCost * rates[currency]}
                        maximumFractionDigits={2}
                      />
                    </IntlProvider>
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="taxesTitle"
                      defaultMessage="Taxes, Surcharges, Fees"
                    />
                  </span>
                  <span className="price">
                    <IntlProvider locale="en">
                      <FormattedNumber
                        style="currency"
                        currency={currency}
                        value={bookingData.taxes * rates[currency]}
                        maximumFractionDigits={2}
                      />
                    </IntlProvider>
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="title">VAT</span>
                  <span className="price">
                    <IntlProvider locale="en">
                      <FormattedNumber
                        style="currency"
                        currency={currency}
                        value={bookingData.vat * rates[currency]}
                        maximumFractionDigits={2}
                      />
                    </IntlProvider>
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="totalforstay"
                      defaultMessage="Total for stay"
                    />
                  </span>
                  <span className="price">
                    <IntlProvider locale="en">
                      <FormattedNumber
                        style="currency"
                        currency={currency}
                        value={bookingData.totalCost * rates[currency]}
                        maximumFractionDigits={2}
                      />
                    </IntlProvider>
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="dropdown-wrapper">
            <div className="dropdown-title" onClick={() => handleMenuClick(2)}>
              <img
                src={`/icons/arrow-${
                  activeMenus.includes(2) ? "up" : "down"
                }-large.png`}
                alt="arrow-down"
              />
              <span className="title">
                <FormattedMessage
                  id="guestInfo"
                  defaultMessage="Guest Information"
                />
              </span>
            </div>
            {activeMenus.includes(2) && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="firstNameTitle"
                      defaultMessage="First Name"
                    />
                  </span>
                  <span className="value">{bookingData.firstName}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="lastNameTitle"
                      defaultMessage="Last Name"
                    />
                  </span>
                  <span className="value">{bookingData.lastName}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="phoneTitle" defaultMessage="Phone" />
                  </span>
                  <span className="value">{bookingData.phone}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="emailTitle" defaultMessage="Email" />
                  </span>
                  <span className="value">{bookingData.email}</span>
                </div>
              </div>
            )}
          </div>
          <div className="dropdown-wrapper">
            <div className="dropdown-title" onClick={() => handleMenuClick(3)}>
              <img
                src={`/icons/arrow-${
                  activeMenus.includes(3) ? "up" : "down"
                }-large.png`}
                alt="arrow-down"
              />
              <span className="title">
                <FormattedMessage
                  id="billingAddress"
                  defaultMessage="Billing Address"
                />
              </span>
            </div>
            {activeMenus.includes(3) && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="firstNameTitle"
                      defaultMessage="First Name"
                    />
                  </span>
                  <span className="value">{bookingData.firstNameBilling}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="lastNameTitle"
                      defaultMessage="Last Name"
                    />
                  </span>
                  <span className="value">{bookingData.lastNameBilling}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="address1Title"
                      defaultMessage="Address1"
                    />
                  </span>
                  <span className="value">{bookingData.address1}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="address2Title"
                      defaultMessage="Address2"
                    />
                  </span>
                  <span className="value">{bookingData.address2}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="cityTitle" defaultMessage="City" />
                  </span>
                  <span className="value">{bookingData.city}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="zipTitle" defaultMessage="Zip" />
                  </span>
                  <span className="value">{bookingData.zipcode}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="stateTitle" defaultMessage="State" />
                  </span>
                  <span className="value">{bookingData.state}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="countryTitle"
                      defaultMessage="Country"
                    />
                  </span>
                  <span className="value">{bookingData.country}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="phoneTitle" defaultMessage="Phone" />
                  </span>
                  <span className="value">{bookingData.phoneBilling}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage id="emailTitle" defaultMessage="Email" />
                  </span>
                  <span className="value">{bookingData.emailBilling}</span>
                </div>
              </div>
            )}
          </div>
          <div className="dropdown-wrapper">
            <div className="dropdown-title" onClick={() => handleMenuClick(4)}>
              <img
                src={`/icons/arrow-${
                  activeMenus.includes(4) ? "up" : "down"
                }-large.png`}
                alt="arrow-down"
              />
              <span className="title">
                <FormattedMessage
                  id="paymentInfo"
                  defaultMessage="Payment Information"
                />
              </span>
            </div>
            {activeMenus.includes(4) && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="cardNumberTitle"
                      defaultMessage="Card Number"
                    />
                  </span>
                  <span className="value">
                    XXXX XXXX XXXX {bookingData.cardNumber.substring(12)}
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="expiryMonthTitle"
                      defaultMessage="Expiry Month"
                    />
                  </span>
                  <span className="value">{bookingData.expiryMonth}</span>
                </div>
                <div className="dropdown-item">
                  <span className="title">
                    <FormattedMessage
                      id="expiryYearTitle"
                      defaultMessage="Expiry Year"
                    />
                  </span>
                  <span className="value">{bookingData.expiryYear}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={showModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="otp-modal">
          <div className="otp-modal-container">
            <span className="title">
              <FormattedMessage
                id="otp"
                defaultMessage="Enter OTP for cancelling the room booking"
              />
            </span>
            <input
              type="number"
              className="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="otp-btn" onClick={verifyOtp}>
              <FormattedMessage id="confirm" defaultMessage="CONFIRM OTP" />
            </button>
            <button className="close-btn" onClick={handleClose}>
              X
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={showConfirmationModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="otp-modal">
          <div className="otp-modal-container">
            <span className="title">
              <FormattedMessage
                id="cancelConfirmation"
                defaultMessage="Do you want to cancel the booking?"
              />
            </span>
            <div className="btns">
              <button className="otp-btn" onClick={handleClose}>
                <FormattedMessage id="no" defaultMessage="NO" />
              </button>
              <button className="otp-btn" onClick={handleCancelBooking}>
                <FormattedMessage id="yes" defaultMessage="YES" />
              </button>
            </div>
            <button className="close-btn" onClick={handleClose}>
              X
            </button>
          </div>
        </div>
      </Modal>
    </div>
  ) : (
    <div className="no-booking">
      <FormattedMessage
        id="noBooking"
        defaultMessage="No booking found for this booking id"
      />
    </div>
  );
}
