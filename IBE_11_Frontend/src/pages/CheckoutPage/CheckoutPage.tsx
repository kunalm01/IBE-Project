import { FormattedMessage } from "react-intl";
import "./CheckoutPage.scss";
import { MUIStepper } from "../../components/Stepper/Stepper";
import { Itinerary } from "../../components/Itinerary/Itinerary";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStepperState } from "../../redux/slices/RoomResultsSlice";
import { RootState } from "../../redux/store/store";
import { useNavigate } from "react-router-dom";
import { Modal } from "@mui/material";
import { setShowTnc } from "../../redux/slices/CheckoutPageSlice";
import { TravelerForm } from "../../components/Form/TravelerForm";
import { BillingForm } from "../../components/Form/BillingForm";
import { PaymentForm } from "../../components/Form/PaymentForm";
import ClipLoader from "react-spinners/ClipLoader";
import { monitorPageView } from "../../utils/ga";

export function CheckoutPage() {
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const selectedItinerary = checkoutPageState.selectedItinerary;
  const showTnc = checkoutPageState.showTnc;
  const currentActiveForm = checkoutPageState.currentActiveForm;
  const isLoading = checkoutPageState.state === "pending";

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    reduxDispatch(setShowTnc(false));
  };

  useEffect(() => {
    reduxDispatch(setStepperState(2));
    if (!selectedItinerary) {
      navigate("/");
    }
  }, [reduxDispatch]);


  useEffect(() => {
    monitorPageView("/checkout", "Checkout Page");
  }, []);

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
  ) : (
    <div className="checkout-wrapper">
      <div className="navigation-links-container">
        <MUIStepper />
      </div>
      <div className="checkout-container">
        <div className="payment-info-container">
          <span className="payment-info-title">
            <FormattedMessage
              id="checkoutPageTitle"
              defaultMessage="Payment Info"
            />
          </span>
          <div className="checkout-info-container">
            <div className="info-wrapper">
              <div className="info-container">
                <span className="info-title">
                  <FormattedMessage
                    id="travelerFormTitle"
                    defaultMessage="1. Traveler Info"
                  />
                </span>
              </div>
              {currentActiveForm === 0 && <TravelerForm />}
            </div>
            <div className="info-wrapper">
              <div className="info-container">
                <span className="info-title">
                  <FormattedMessage
                    id="billingFormTitle"
                    defaultMessage="2. Billing Info"
                  />
                </span>
              </div>
              {currentActiveForm === 1 && <BillingForm />}
            </div>
            <div className="info-wrapper">
              <div className="info-container">
                <span className="info-title">
                  <FormattedMessage
                    id="paymentFormTitle"
                    defaultMessage="3. Payment Info"
                  />
                </span>
              </div>
              {currentActiveForm === 2 && <PaymentForm />}
            </div>
          </div>
        </div>
        <div className="itinerary-wrapper">
          <Itinerary checkout />
          <div className="contact-container">
            <span className="title">
              <FormattedMessage id="help" defaultMessage="Need help?" />
            </span>
            <div className="contact">
              <span className="phone">
                <FormattedMessage
                  id="helpCall"
                  defaultMessage="Call 1-800-555-5555"
                />
              </span>
              <span className="timing">
                <FormattedMessage
                  id="helpTime"
                  defaultMessage="Mon-Fri 8a-5p EST"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={showTnc}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="modal-tnc">
          <div className="modal-tnc-container">
            <span className="title">
              <FormattedMessage
                id="tnc"
                defaultMessage="Terms and Conditions"
              />
            </span>
            <div className="tnc">
              <div>
                <span className="heading">
                  <FormattedMessage
                    id="tnc1"
                    defaultMessage="1. Reservation Policy:"
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc1-1"
                    defaultMessage="- All reservations are subject to availability and confirmation by the hotel."
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc1-2"
                    defaultMessage="- Guests must provide valid identification and credit card information at the time of booking."
                  />
                </span>
              </div>
              <div>
                <span className="heading">
                  <FormattedMessage
                    id="tnc2"
                    defaultMessage="2. Cancellation Policy:"
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc2-1"
                    defaultMessage="- Cancellation policies vary depending on the rate plan selected and the hotel's policy."
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc2-2"
                    defaultMessage="- Guests are advised to review the cancellation policy at the time of booking."
                  />
                </span>
              </div>
              <div>
                <span className="heading">
                  <FormattedMessage
                    id="tnc3"
                    defaultMessage="3. Check-in/Check-out:"
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    defaultMessage="- Check-in time is typically after 2:00 PM, and check-out time is before 12:00 PM, local hotel time."
                    id="tnc3-1"
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    defaultMessage="- Early check-in or late check-out may be available upon request and subject to availability."
                    id="tnc3-2"
                  />
                </span>
              </div>
              <div>
                <span className="heading">
                  <FormattedMessage id="tnc4" defaultMessage="4. Payment:" />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc4-1"
                    defaultMessage="- Payment for accommodations and any additional services must be settled in full upon check-in."
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc4-2"
                    defaultMessage="- Accepted forms of payment may include cash, credit cards, or other approved payment methods."
                  />
                </span>
              </div>
              <div>
                <span className="heading">
                  <FormattedMessage
                    id="tnc5"
                    defaultMessage="5. Guest Responsibilities:"
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id="tnc5-1"
                    defaultMessage="- Guests are responsible for any damages caused to the hotel property during their stay."
                  />
                </span>
                <br />
                <span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" "}
                  <FormattedMessage
                    id="tnc5-2"
                    defaultMessage="- Guests must adhere to hotel policies regarding noise, behavior, and use of amenities."
                  />
                </span>
              </div>
              <div>
                <FormattedMessage
                  id="tnc6"
                  defaultMessage="These terms and conditions are subject to change without prior notice. Guests are encouraged to review the latest terms and conditions at the time of booking."
                />
              </div>
            </div>
            <button className="close-btn" onClick={handleClose}>
              X
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
