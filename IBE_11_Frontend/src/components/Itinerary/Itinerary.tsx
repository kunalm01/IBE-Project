import { useDispatch, useSelector } from "react-redux";
import "./Itinerary.scss";
import {
  setSelectedModal,
  setStepperState,
} from "../../redux/slices/RoomResultsSlice";
import { useNavigate } from "react-router-dom";
import {
  resetSelectedItinerary,
  setPrices,
} from "../../redux/slices/CheckoutPageSlice";
import { RootState } from "../../redux/store/store";
import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import { ItineraryProps } from "../../utils/interface";

interface IDateWiseRate {
  date: string;
  rate: number;
}

export function Itinerary({ checkout }: ItineraryProps) {
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const appState = useSelector((state: RootState) => state.app);
  const locale = appState.locale;
  const currentConfig = appState.currentConfig;
  const selectedItinerary = checkoutPageState.selectedItinerary;
  const currency = appState.currency;
  const rates = appState.rate;
  const prices = checkoutPageState.prices;
  const [showModal, setShowModal] = useState<number>(0);
  const [dateWiseRates, setDateWiseRates] = useState<IDateWiseRate[]>([]);

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const calculateDays = () => {
    if (!selectedItinerary?.startDate || !selectedItinerary?.endDate) {
      return 0;
    }

    const startDate = new Date(selectedItinerary.startDate);
    const endDate = new Date(selectedItinerary.endDate);

    const differenceMs = endDate.getTime() - startDate.getTime();

    const days = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return days;
  };

  const handleItineraryRemove = () => {
    reduxDispatch(resetSelectedItinerary());
    navigate("/");
  };

  const handleClose = () => {
    setShowModal(0);
  };

  const handlePromotionInfoClick = () => {
    setShowModal(1);
  };

  const handleTaxInfoClick = () => {
    setShowModal(2);
  };

  const handleClick = () => {
    if (checkout) {
      reduxDispatch(setSelectedModal(""));
      reduxDispatch(setStepperState(1));
      navigate("/rooms");
    } else {
      navigate("/checkout");
    }
  };

  const formatGuestInfo = (counts: { [key: string]: number }) => {
    type MyMap = {
      [key: string]: string;
    };

    const map: MyMap = {
      Adult: "Adulto",
      Teen: "Adolescente",
      Kid: "Niño",
    };
    const guestTypes = Object.keys(counts)
      .filter((key) => counts[key] > 0)
      .map((key) => key.substring(0, key.length - 1));

    const guestInfo = guestTypes
      .map(
        (type) =>
          `${counts[type + "s"]} ${
            counts[type + "s"] > 1
              ? locale === "en"
                ? type + "s"
                : map[type] + "s"
              : locale === "en"
              ? type
              : map[type]
          }`
      )
      .join(" ");

    return guestInfo;
  };

  const formatDate = (date: Date, includeYear: boolean) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
      year: includeYear ? "numeric" : undefined,
    };
    return date.toLocaleDateString("en-US", options);
  };

  const rooms = selectedItinerary?.selectedRooms ?? 1;
  const totalDays = calculateDays();

  useEffect(() => {
    let sum = 0;
    dateWiseRates.forEach((dateWiseRate) => (sum += dateWiseRate.rate));
    const promoDiscount =
      selectedItinerary && selectedItinerary.selectedPromotion
        ? parseFloat(
            (
              (1 - selectedItinerary?.selectedPromotion!.priceFactor) *
              (sum * rooms)
            ).toFixed(2)
          )
        : 0.0;
    const total = sum * rooms - promoDiscount;
    const taxes = parseFloat((currentConfig.tax_percentage * total).toFixed(2));
    const vat = parseFloat((currentConfig.vat_percentage * total).toFixed(2));
    const subtotal = parseFloat((total + taxes + vat).toFixed(2));
    reduxDispatch(
      setPrices({
        roomsTotal: sum * rooms,
        promoDiscount: promoDiscount,
        taxes,
        vat,
        subtotal,
      })
    );
  }, [dateWiseRates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://team-11-ibe-apim.azure-api.net/api/v1/rate-breakdown`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startDate: selectedItinerary?.startDate,
              endDate: selectedItinerary?.endDate,
              propertyId: 11,
              roomTypeId: selectedItinerary?.room.roomTypeId,
            }),
          }
        );
        const data = await response.json();
        setDateWiseRates(data.roomRateList);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchData();
  }, []);

  const fullPaymentRequired =
    selectedItinerary?.selectedPromotion?.promotionId === 5;

  return (
    currentConfig &&
    selectedItinerary && (
      <div
        className={`itinerary-container ${checkout && "itinerary-checkout"}`}
      >
        <span className="itinerary-title">
          <FormattedMessage
            id="itineraryTitle"
            defaultMessage="Your Trip Itinerary"
          />
        </span>
        <div className="name-container">
          <span className="name">
            <FormattedMessage
              id="team 11 hotel"
              defaultMessage={`Team ${currentConfig.property_id} Hotel`}
            />
          </span>
          <button className="remove-btn" onClick={handleItineraryRemove}>
            <FormattedMessage id="removeTitle" defaultMessage="Remove" />
          </button>
        </div>
        <div className="info-container">
          <div className="date-guest-container">
            <span className="date-range">
              {formatDate(new Date(selectedItinerary.startDate), false)} -{" "}
              {formatDate(new Date(selectedItinerary.endDate), true)}
            </span>
            <div className="space"></div>
            <span className="guest">
              {formatGuestInfo(selectedItinerary.guestCounts)}
            </span>
          </div>
          <div className="room-type-container">
            <span className="room-type">
              <FormattedMessage
                id={selectedItinerary.room.roomTypeName.toLowerCase()}
                defaultMessage={selectedItinerary.room.roomTypeName}
              />
            </span>
            <span className="roomsNo">
              {selectedItinerary.selectedRooms}{" "}
              {selectedItinerary.selectedRooms === 1
                ? locale === "en"
                  ? "room"
                  : "habita"
                : locale === "en"
                ? "rooms"
                : "habitas"}
            </span>
          </div>
          <div className="date-container">
            <span className="date">
              <FormattedMessage id="price" defaultMessage="Price" />
            </span>
            <span className="price">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={
                    ((prices?.roomsTotal ?? 0) / rooms / totalDays) *
                    rates[currency]
                  }
                  maximumFractionDigits={0}
                />
              </IntlProvider>
              <span>
                /<FormattedMessage id="night" defaultMessage="night" />
              </span>
            </span>
          </div>
          {selectedItinerary.selectedPromotion && (
            <div className="promo-container">
              <div className="promo-info">
                <span className="promo-name">
                  <FormattedMessage
                    id={selectedItinerary.selectedPromotion.promotionTitle.toLowerCase()}
                    defaultMessage={
                      selectedItinerary.selectedPromotion.promotionTitle
                    }
                  />
                  &nbsp;
                </span>
                <img
                  src="/icons/info.png"
                  alt="info"
                  className="icon"
                  onClick={handlePromotionInfoClick}
                />
              </div>
              <span className="price">
                -
                <IntlProvider locale="en">
                  <FormattedNumber
                    style="currency"
                    currency={currency}
                    value={(prices?.promoDiscount ?? 0) * rates[currency]}
                    maximumFractionDigits={2}
                  />
                </IntlProvider>
              </span>
            </div>
          )}
        </div>
        <div className="total-container">
          <div className="subtotal-container">
            <span className="title">
              <FormattedMessage id="subtotalTitle" defaultMessage="Subtotal" />
            </span>
            <span className="subtotal">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={(prices?.subtotal ?? 0) * rates[currency]}
                  maximumFractionDigits={2}
                />
              </IntlProvider>
            </span>
          </div>
          <div className="subtotal-container">
            <div className="tax-container">
              <span className="title">
                <FormattedMessage
                  id="taxesTitle"
                  defaultMessage="Taxes, Surcharges, Fees"
                />
                &nbsp;
              </span>
              <img
                src="/icons/info.png"
                alt="info"
                className="icon"
                onClick={handleTaxInfoClick}
              />
            </div>
            <span className="subtotal">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={(prices?.taxes ?? 0) * rates[currency]}
                  maximumFractionDigits={2}
                />
              </IntlProvider>
            </span>
          </div>
          <div className="subtotal-container">
            <span className="title">VAT</span>
            <span className="subtotal">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={(prices?.vat ?? 0) * rates[currency]}
                  maximumFractionDigits={2}
                />
              </IntlProvider>
            </span>
          </div>
        </div>
        <div className="due-container">
          <div className="due">
            <span className="title">
              <FormattedMessage id="dueNow" defaultMessage="Due Now" />
            </span>
            <span className="amount">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={
                    parseFloat(
                      (
                        (prices?.subtotal ?? 0) *
                        (fullPaymentRequired
                          ? 1
                          : currentConfig.due_now_percentage ?? 0.0)
                      ).toFixed(2)
                    ) * rates[currency]
                  }
                  maximumFractionDigits={2}
                />
              </IntlProvider>
            </span>
          </div>
          <div className="due">
            <span className="title">
              <FormattedMessage id="dueResort" defaultMessage="Due at Resort" />
            </span>
            <span className="amount">
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={
                    parseFloat(
                      (
                        (prices?.subtotal ?? 0) *
                        (fullPaymentRequired
                          ? 0
                          : 1 - currentConfig.due_now_percentage)
                      ).toFixed(2)
                    ) * rates[currency]
                  }
                  maximumFractionDigits={2}
                />
              </IntlProvider>
            </span>
          </div>
        </div>
        <button className="checkout-btn" onClick={handleClick}>
          {checkout ? (
            <FormattedMessage
              id="continueShopping"
              defaultMessage="CONTINUE SHOPPING"
            />
          ) : (
            <FormattedMessage id="checkout" defaultMessage="CHECKOUT" />
          )}
        </button>
        <Modal
          open={showModal != 0}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="modal-promo">
            <div className="modal-promo-container">
              {showModal === 1 ? (
                <>
                  <div className="promotion-container">
                    <span className="promotion-title">
                      <FormattedMessage
                        id={selectedItinerary.selectedPromotion?.promotionTitle.toLowerCase()}
                        defaultMessage={
                          selectedItinerary.selectedPromotion?.promotionTitle
                        }
                      />
                    </span>
                    <span className="promotion-description">
                      <FormattedMessage
                        id={`${selectedItinerary.selectedPromotion?.promotionTitle.toLowerCase()} description`}
                        defaultMessage={
                          selectedItinerary.selectedPromotion
                            ?.promotionDescription
                        }
                      />
                    </span>
                  </div>
                  <div className="package-total-container">
                    <span className="title">
                      <FormattedMessage
                        id="packageTotal"
                        defaultMessage="Package Total"
                      />
                    </span>
                    <span className="package-total">
                      {" "}
                      <IntlProvider locale="en">
                        <FormattedNumber
                          style="currency"
                          currency={currency}
                          value={(prices?.subtotal ?? 0) * rates[currency]}
                          maximumFractionDigits={2}
                        />
                      </IntlProvider>
                    </span>
                  </div>
                </>
              ) : (
                <div className="rate-breakdown-container">
                  <div className="title-container">
                    <span className="title">
                      <FormattedMessage
                        id="rateBreakdown"
                        defaultMessage="Rate Breakdown"
                      />
                    </span>
                    <span>
                      <FormattedMessage
                        id={selectedItinerary.room.roomTypeName.toLowerCase()}
                        defaultMessage={selectedItinerary.room.roomTypeName}
                      />
                    </span>
                    <span>
                      <FormattedMessage
                        id="nightlyRate"
                        defaultMessage="Nightly Rate (per room)"
                      />
                    </span>
                  </div>
                  {selectedItinerary.selectedPromotion && (
                    <div className="promotion">
                      <span className="title">
                        <FormattedMessage
                          id={selectedItinerary.selectedPromotion?.promotionTitle.toLowerCase()}
                          defaultMessage={
                            selectedItinerary.selectedPromotion?.promotionTitle
                          }
                        />
                      </span>
                      <span>
                        -
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={
                              (prices?.promoDiscount ?? 0) * rates[currency]
                            }
                            maximumFractionDigits={2}
                          />
                        </IntlProvider>
                      </span>
                    </div>
                  )}
                  <div className="daily-rates">
                    {dateWiseRates.map((dateWiseRate) => (
                      <div key={dateWiseRate.date} className="daily-rate">
                        <span className="date">
                          {new Date(dateWiseRate.date).toDateString()}
                        </span>
                        <span className="rate">
                          <IntlProvider locale="en">
                            <FormattedNumber
                              style="currency"
                              currency={currency}
                              value={dateWiseRate.rate * rates[currency]}
                              maximumFractionDigits={2}
                            />
                          </IntlProvider>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="room-total">
                    <span className="title">
                      <FormattedMessage
                        id="roomTotal"
                        defaultMessage="Room Total"
                      />
                    </span>
                    <span className="total">
                      <IntlProvider locale="en">
                        <FormattedNumber
                          style="currency"
                          currency={currency}
                          value={
                            parseFloat(
                              ((prices?.roomsTotal ?? 0) / rooms).toFixed(2)
                            ) * rates[currency]
                          }
                          maximumFractionDigits={2}
                        />
                      </IntlProvider>
                    </span>
                  </div>
                  <div className="taxes">
                    <span className="title">
                      <FormattedMessage
                        id="taxesFees"
                        defaultMessage="Taxes and fees (per room)"
                      />
                    </span>
                    <div className="tax">
                      <span>
                        <FormattedMessage
                          id="resortFee"
                          defaultMessage="Resort fee"
                        />
                      </span>
                      <span className="total">
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={
                              parseFloat(
                                ((prices?.taxes ?? 0) / rooms).toFixed(2)
                              ) * rates[currency]
                            }
                            maximumFractionDigits={2}
                          />
                        </IntlProvider>
                      </span>
                    </div>
                    <div className="tax">
                      <span>
                        <FormattedMessage
                          id="tax"
                          defaultMessage="Occupancy tax"
                        />
                      </span>
                      <span className="total">
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={
                              parseFloat(
                                ((prices?.vat ?? 0) / rooms).toFixed(2)
                              ) * rates[currency]
                            }
                            maximumFractionDigits={2}
                          />
                        </IntlProvider>
                      </span>
                    </div>
                  </div>
                  <div className="subtotals">
                    <div className="subtotal">
                      <span className="title">
                        <FormattedMessage
                          id="dueNow"
                          defaultMessage="Due now"
                        />
                      </span>
                      <span className="total">
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={
                              parseFloat(
                                (
                                  (prices?.subtotal ?? 0) *
                                  (fullPaymentRequired
                                    ? 1
                                    : currentConfig.due_now_percentage)
                                ).toFixed(2)
                              ) * rates[currency]
                            }
                            maximumFractionDigits={2}
                          />
                        </IntlProvider>
                      </span>
                    </div>
                    <div className="subtotal">
                      <span className="title">
                        <FormattedMessage
                          id="dueResort"
                          defaultMessage="Due at resort"
                        />
                      </span>
                      <span className="total">
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={
                              parseFloat(
                                (
                                  (prices?.subtotal ?? 0) *
                                  (fullPaymentRequired
                                    ? 0
                                    : 1 - currentConfig.due_now_percentage)
                                ).toFixed(2)
                              ) * rates[currency]
                            }
                            maximumFractionDigits={2}
                          />
                        </IntlProvider>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <button className="close-btn" onClick={handleClose}>
                X
              </button>
            </div>
          </div>
        </Modal>
      </div>
    )
  );
}
