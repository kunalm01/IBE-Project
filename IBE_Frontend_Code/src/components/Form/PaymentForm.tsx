import { useDispatch, useSelector } from "react-redux";
import {
  resetBookingId,
  resetSelectedItinerary,
  setCurrentActiveForm,
  setPaymentFields,
  setShowTnc,
  setState,
} from "../../redux/slices/CheckoutPageSlice";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store/store";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import { BookingRequestDTO, postBooking } from "../../redux/thunks/postBooking";
import { useEffect, useState } from "react";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { useCreditCardValidator } from "react-creditcard-validator";
import { monitorEvent } from "../../utils/ga";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const paymentSchema = yup
  .object({
    expiryMonth: yup
      .string()
      .length(2, "MM format")
      .test("valid-month", "Invalid month", (value) => {
        const month = parseInt(value ?? "");
        return !isNaN(month) && month >= 1 && month <= 12;
      })
      .required("Field cannot be empty"),
    expiryYear: yup
      .string()
      .length(4, "YYYY format")
      .test("valid-year", "Invalid year", (value) => {
        const year = parseInt(value ?? "");
        return !isNaN(year) && year >= currentYear;
      })
      .test(
        "expiry-greater-than-current",
        "Expiry must be in the future",
        (value, context) => {
          const year = parseInt(context.parent.expiryYear ?? value);
          const month = parseInt(context.parent.expiryMonth ?? "");
          if (year > currentYear) {
            return true;
          } else if (year === currentYear) {
            return month >= currentMonth;
          }
          return false;
        }
      )
      .required("Field cannot be empty"),
    cvv: yup
      .string()
      .min(3, "CVV should be of at least 3 digits")
      .max(4, "CVV should be of at most 4 digits")
      .required("Field cannot be empty"),
    termsAndConditions: yup
      .boolean()
      .oneOf([true], "Please accept the terms and conditions")
      .required("Please accept the terms and conditions"),
  })
  .required();

type paymentFormFields = yup.InferType<typeof paymentSchema>;

export function PaymentForm() {
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const appState = useSelector((state: RootState) => state.app);
  const tenantId = appState.configData.tenant_id;
  const currency = appState.currency;
  const rates = appState.rate;
  const currentConfig = appState.currentConfig;
  const travelerFields = checkoutPageState.travelerFields;
  const billingFields = checkoutPageState.billingFields;
  const paymentFields = checkoutPageState.paymentFields;
  const prices = checkoutPageState.prices;
  const selectedItinerary = checkoutPageState.selectedItinerary;
  const subtotal = checkoutPageState.prices?.subtotal;
  const bookingId = checkoutPageState.bookingId;
  const errorOccured = checkoutPageState.state === "error";
  const [hasSubscribed, setHasSubscribed] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>(
    paymentFields.cardNumber
  );
  const [expiryMonth, setExpiryMonth] = useState<string>(
    paymentFields.expiryMonth
  );
  const [expiryYear, setExpiryYear] = useState<string>(
    paymentFields.expiryYear
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<paymentFormFields>({
    resolver: yupResolver(paymentSchema),
  });

  const {
    getCardNumberProps,
    meta: { erroredInputs },
  } = useCreditCardValidator();

  const reduxDispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(e.target.value);
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryMonth(e.target.value);
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryYear(e.target.value);
  };

  const handleTncClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reduxDispatch(setShowTnc(true));
  };

  const handlePaymentPrevButtonClick = () => {
    reduxDispatch(setCurrentActiveForm(1));
  };

  const calculateDays = () => {
    if (!selectedItinerary?.startDate || !selectedItinerary?.endDate) {
      return 0;
    }

    const startDate = new Date(selectedItinerary.startDate);
    const endDate = new Date(selectedItinerary.endDate);

    const differenceMs = endDate.getTime() - startDate.getTime();

    const days = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return days + 1;
  };

  const handleSubscribe = () => {
    setHasSubscribed(!hasSubscribed);
  };

  const handlePurchase = () => {
    if (!selectedItinerary || !prices) {
      return;
    }
    monitorEvent(
      "Room Purchased",
      `${selectedItinerary.room.roomTypeName} Purchased`,
      "Room Purchase"
    );

    const bookingRequestDto: BookingRequestDTO = {
      startDate: selectedItinerary?.startDate,
      endDate: selectedItinerary?.endDate,
      roomCount: selectedItinerary.selectedRooms,
      adultCount: selectedItinerary.guestCounts["Adults"],
      teenCount: selectedItinerary.guestCounts["Teens"],
      kidCount: selectedItinerary.guestCounts["Kids"],
      seniorCount: selectedItinerary.guestCounts["Senior Citizens"],
      tenantId,
      propertyId: currentConfig.property_id,
      roomTypeId: selectedItinerary.room.roomTypeId,
      roomName: selectedItinerary.room.roomTypeName,
      roomImageUrl: selectedItinerary.roomImageUrl,
      costInfo: {
        totalCost: prices?.subtotal,
        amountDueAtResort:
          prices?.subtotal * (1 - currentConfig.due_now_percentage),
        nightlyRate: parseFloat(
          (
            prices.roomsTotal /
            selectedItinerary.selectedRooms /
            calculateDays()
          ).toFixed(2)
        ),
        taxes: prices.taxes,
        vat: prices.vat,
      },
      promotionInfo: {
        promotionId: selectedItinerary.selectedPromotion
          ? selectedItinerary.selectedPromotion.promotionId > 6
            ? 0
            : selectedItinerary.selectedPromotion?.promotionId
          : 0,
        promotionTitle:
          selectedItinerary.selectedPromotion?.promotionTitle ?? "",
        priceFactor: selectedItinerary.selectedPromotion?.priceFactor ?? 0.0,
        promotionDescription:
          selectedItinerary.selectedPromotion?.promotionDescription ?? "",
      },
      guestInfo: {
        firstName: travelerFields.firstName,
        lastName: travelerFields.lastName ?? "",
        phone: travelerFields.phone,
        emailId: travelerFields.email,
        hasSubscribed,
      },
      billingInfo: {
        firstName: billingFields.firstName,
        lastName: billingFields.lastName ?? "",
        address1: billingFields.address1,
        address2: billingFields.address2 ?? "",
        city: billingFields.city,
        zipcode: billingFields.zipcode,
        state: billingFields.state.name,
        country: billingFields.country.name,
        phone: billingFields.phone,
        emailId: billingFields.email,
      },
      paymentInfo: {
        cardNumber: cardNumber.replace(/ /g, ""),
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
      },
    };
    reduxDispatch(postBooking(bookingRequestDto));
  };

  const onSubmit: SubmitHandler<paymentFormFields> = async (data) => {
    reduxDispatch(setPaymentFields({ ...data, cardNumber: cardNumber }));
    handlePurchase();
  };

  useEffect(() => {
    if (bookingId > 0) {
      setButtonDisabled(false);
      reduxDispatch(
        showSnackbar({ message: "Booking successful", type: "success" })
      );
      reduxDispatch(resetSelectedItinerary());
      reduxDispatch(
        setPaymentFields({
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
        })
      );
      navigate(`/booking?bookingId=${bookingId}`);
      reduxDispatch(resetBookingId());
    }
  }, [bookingId]);

  useEffect(() => {
    if (errorOccured) {
      reduxDispatch(
        showSnackbar({
          message: "Something went wrong try again",
          type: "error",
        })
      );
      reduxDispatch(resetSelectedItinerary());
      reduxDispatch(
        setPaymentFields({
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
        })
      );
      navigate("/rooms");
      reduxDispatch(setState("fulfilled"));
    }
  }, [errorOccured]);

  return (
    <form className="info-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="triple-input">
        <div className="one-input-container">
          <span className="title">
            <FormattedMessage
              id="cardNumberTitle"
              defaultMessage="Card Number"
            />
            *
          </span>
          <input
            {...getCardNumberProps()}
            value={cardNumber}
            onChange={handleCardNumberChange}
            type="password"
            minLength={18}
            maxLength={19}
            name="cardNumber"
            id="card-name"
            className="input"
          />
          {erroredInputs.cardNumber && (
            <div style={{ color: "red" }}>
              <FormattedMessage
                id={erroredInputs.cardNumber}
                defaultMessage={erroredInputs.cardNumber}
              />
            </div>
          )}
        </div>
        <div className="two-input-container">
          <div className="inside-container">
            <span className="title">
              <FormattedMessage id="expiryMonthTitle" defaultMessage="Exp MM" />
              *
            </span>
            <input
              {...register("expiryMonth")}
              type="number"
              minLength={2}
              maxLength={2}
              name="expiryMonth"
              id="expiry-month"
              className="input"
              value={expiryMonth}
              onChange={handleExpiryMonthChange}
            />
            {errors.expiryMonth && (
              <div style={{ color: "red" }}>
                <FormattedMessage
                  id={errors.expiryMonth.message}
                  defaultMessage={errors.expiryMonth.message}
                />
              </div>
            )}
          </div>
          <div className="inside-container">
            <span className="title">
              <FormattedMessage
                id="expiryYearTitle"
                defaultMessage="Exp YYYY"
              />
              *
            </span>
            <input
              {...register("expiryYear")}
              type="number"
              minLength={4}
              maxLength={4}
              name="expiryYear"
              id="expiry-year"
              className="input"
              value={expiryYear}
              onChange={handleExpiryYearChange}
            />
            {errors.expiryYear && (
              <div style={{ color: "red" }}>
                <FormattedMessage
                  id={errors.expiryYear.message}
                  defaultMessage={errors.expiryYear.message}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="input-container">
        <span className="title">
          <FormattedMessage id="cvvTitle" defaultMessage="CVV Code" />*
        </span>
        <input
          {...register("cvv")}
          type="password"
          maxLength={4}
          minLength={3}
          name="cvv"
          id="cvv"
          className="input"
        />
        {errors.cvv && (
          <div style={{ color: "red" }}>
            <FormattedMessage
              id={errors.cvv.message}
              defaultMessage={errors.cvv.message}
            />
          </div>
        )}
      </div>
      <div className="checkbox-container">
        <div className="send-offers-container">
          <input
            type="checkbox"
            name="send-offers"
            id="send-offers"
            checked={hasSubscribed}
            onChange={handleSubscribe}
          />
          <label htmlFor="send-offers">
            <FormattedMessage
              id="sendOffersLabel"
              defaultMessage="Send me special offers"
            />
          </label>
        </div>
        <div className="send-offers-container">
          <input
            type="checkbox"
            id="terms-and-conditions"
            {...register("termsAndConditions")}
          />
          <label htmlFor="terms-and-conditions">
            <span>
              <FormattedMessage
                id="termsAndConditionsLabel"
                defaultMessage="I agree to the "
              />
              &nbsp;
            </span>
            <button
              type="button"
              onClick={handleTncClick}
              style={{ textDecoration: "underline" }}
            >
              <FormattedMessage
                id="termsAndPoliciesBtn"
                defaultMessage="Terms and Policies"
              />
            </button>
            <span>
              &nbsp;
              <FormattedMessage
                id="ofTravelLabel"
                defaultMessage=" of travel"
              />
            </span>
          </label>
        </div>
        {errors.termsAndConditions && (
          <div style={{ color: "red" }}>
            <FormattedMessage
              id={errors.termsAndConditions.message}
              defaultMessage={errors.termsAndConditions.message}
            />
          </div>
        )}
      </div>

      <div className="total-due">
        <span>
          <FormattedMessage id="totalDueLabel" defaultMessage="Total Due" />
        </span>
        <span className="amount">
          <IntlProvider locale="en">
            <FormattedNumber
              style="currency"
              currency={currency}
              value={(subtotal ?? 0.0) * rates[currency]}
              maximumFractionDigits={2}
            />
          </IntlProvider>
        </span>
      </div>
      <div className="billing-button">
        <button className="prev-btn" onClick={handlePaymentPrevButtonClick}>
          <FormattedMessage
            id="editBillingInfoBtn"
            defaultMessage="Edit Billing Info."
          />
        </button>
        <button type="submit" className="next-btn" disabled={buttonDisabled}>
          <FormattedMessage id="purchaseBtn" defaultMessage="PURCHASE" />
        </button>
      </div>
    </form>
  );
}
