import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedModal,
  setStepperState,
} from "../../redux/slices/RoomResultsSlice";
import { Modal, Rating } from "@mui/material";
import { RootState } from "../../redux/store/store";
import { ImageCarousel } from "../Carousel/Carousel";
import { IPromotion, RoomModalProps } from "../../utils/interface";
import "./RoomModal.scss";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import { useMediaQuery } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { setSelectedItinerary } from "../../redux/slices/CheckoutPageSlice";
import ClipLoader from "react-spinners/ClipLoader";
import { monitorEvent } from "../../utils/ga";

interface IReviews {
  username: string;
  review: string;
  rating: number;
}

export function RoomModal({ room, data }: Readonly<RoomModalProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const currentConfig = appState.currentConfig;
  const currency = appState.currency;
  const rates = appState.rate;
  const subscription = appState.subscription;
  const tenantId = appState.configData.tenant_id;
  const startDate = landingPageState.startDate;
  const endDate = landingPageState.endDate;
  const counts = landingPageState.counts;
  const isMilitaryPersonnel = landingPageState.isMilitaryPersonnel;
  const selectedRooms = landingPageState.selectedRooms;
  const selectedModal = useSelector(
    (state: RootState) => state.roomResults.selectedModal
  );
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [reviews, setReviews] = useState<IReviews[]>([]);
  const [promocode, setPromocode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    reduxDispatch(setSelectedModal(""));
    reduxDispatch(setStepperState(0));
  };

  const isSeniorCitizensActive = currentConfig.allowed_guests.filter(
    (guest) => guest.title === "Senior Citizens"
  )[0].active;

  const handleSelect = (promotion: IPromotion | null) => {
    monitorEvent("Room Selected", `${room.roomTypeName} Selected` , "Room Select");
    reduxDispatch(setStepperState(2));
    reduxDispatch(setSelectedModal(""));
    if (startDate && endDate) {
      reduxDispatch(
        setSelectedItinerary({
          roomImageUrl: data.roomImages[0],
          room,
          selectedRooms,
          startDate,
          endDate,
          guestCounts: counts,
          selectedPromotion: promotion,
        })
      );
    }
    navigate("/checkout");
  };

  const handleApply = async () => {
    if (promocode === "FTE30" && subscription < 2) {
      reduxDispatch(
        showSnackbar({
          message: "You are not eligible for this offer",
          type: "error",
        })
      );
      return;
    }

    const response = await fetch(
      `https://team-11-ibe-apim.azure-api.net/api/v1/room-promocode?tenantId=1&roomTypeId=${room.roomTypeId}&inputPromoCode=${promocode}`
    );
    const promocodeData = await response.json();

    if (!promocodeData.promoTitle) {
      reduxDispatch(
        showSnackbar({ message: "Invalid Promocode", type: "error" })
      );
    } else {
      if (
        promotions.filter(
          (promo) => promo.promotionTitle === promocodeData.promoTitle
        ).length > 0
      ) {
        reduxDispatch(
          showSnackbar({ message: "Promocode already applied", type: "info" })
        );
      } else {
        setPromotions([
          ...promotions,
          {
            promotionId: promotions.length + 7,
            promotionDescription: promocodeData.description,
            priceFactor: promocodeData.promoPriceFactor,
            promotionTitle: promocodeData.promoTitle,
          },
        ]);
        reduxDispatch(
          showSnackbar({
            message: "Promocode applied successfully",
            type: "success",
          })
        );
        setPromocode("");
      }
    }
  };

  const changeInputPromocode = (e: ChangeEvent<HTMLInputElement>) => {
    setPromocode(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedModal === room.roomTypeName) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://team-11-ibe-apim.azure-api.net/api/v1/promotion`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                seniorCitizen:
                  isSeniorCitizensActive && counts["Senior Citizens"] > 0,
                military: isMilitaryPersonnel,
                kduMembership: subscription >= 1,
              }),
            }
          );
          const promotionsData = await response.json();
          setPromotions(promotionsData.promotions);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching room data:", error);
        }
      }
    };

    const fetchReviews = async () => {
      if (selectedModal === room.roomTypeName) {
        setIsReviewLoading(true);
        try {
          const response = await fetch(
            `https://team-11-ibe-apim.azure-api.net/api/v1/room-review/${tenantId}/${room.roomTypeId}`
          );
          const reviewssData = await response.json();
          setReviews(reviewssData.roomReviews);
          setIsReviewLoading(false);
        } catch (error) {
          console.error("Error fetching room data:", error);
        }
      }
    };

    fetchReviews();
    fetchData();
  }, [selectedModal]);

  const isMobileView = useMediaQuery("(max-width: 600px)");

  return (
    <Modal
      open={selectedModal === room.roomTypeName}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="room-modal-container">
        <div className="room-image-carousel">
          <ImageCarousel
            images={data?.roomImages}
            height={isMobileView ? 200 : 380}
          />
          <div className="room-title">
            <FormattedMessage
              id={room.roomTypeName.toLowerCase()}
              defaultMessage={room.roomTypeName}
            />
          </div>
          <button className="close-modal-btn" onClick={handleClose}>
            X
          </button>
        </div>
        <div className="modal-content">
          <div className="room-info">
            <div className="room-description-container">
              <div className="room-capacity">
                <div className="room-info-div">
                  <img src="/icons/user.png" alt="user" />
                  <span>&nbsp; 1-{room.maxCapacity}</span>
                </div>
                <div className="room-info-div">
                  <img src="/icons/bed.png" alt="bed" />
                  <span>
                    &nbsp; {room.doubleBed > 0 && room.doubleBed}{" "}
                    {room.doubleBed > 0 && (
                      <FormattedMessage id="king" defaultMessage="King" />
                    )}
                    {room.doubleBed > 0 && room.singleBed > 0 && " & "}
                    {room.singleBed > 0 && room.singleBed}{" "}
                    {room.singleBed > 0 && (
                      <FormattedMessage id="queen" defaultMessage="Queen" />
                    )}
                  </span>
                </div>
                <div className="room-info-div">
                  &nbsp; &nbsp;{room.areaInSquareFeet} ft
                  <sup style={{ alignSelf: "flex-start" }}>2</sup>
                </div>
              </div>
              <div className="description">
                <FormattedMessage
                  id={`description${room.roomTypeId}`}
                  defaultMessage={data.roomDescription}
                />
              </div>
            </div>
            <div className="amenities-container">
              <span className="title">
                <FormattedMessage id="amenities" defaultMessage="Amenities" />
              </span>
              <div className="amenities">
                {data.roomAmenities.map((amenity) => (
                  <div key={amenity} className="amenity">
                    <img src="/icons/verified.png" alt="verified" />
                    <span>
                      &nbsp;
                      <FormattedMessage
                        id={amenity.toLowerCase()}
                        defaultMessage={amenity}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rates-reviews-container">
            <div className="rates-container">
              <div className="rate-container">
                <span className="title">
                  <FormattedMessage
                    id="standardRate"
                    defaultMessage="Standard Rate"
                  />
                </span>
                <div className="standard-rate-container">
                  <div className="standard-rate-description-container">
                    <span className="standard-rate-title">
                      <FormattedMessage
                        id="standardRate"
                        defaultMessage="Standard Rate"
                      />
                    </span>
                    <span className="standard-rate-description">
                      <FormattedMessage
                        id="standardRateDescription"
                        defaultMessage="Standard Rate"
                      />
                    </span>
                  </div>
                  <div className="standard-rate">
                    <div className="price-container">
                      <span className="price">
                        <IntlProvider locale="en">
                          <FormattedNumber
                            style="currency"
                            currency={currency}
                            value={room.price * rates[currency]}
                            maximumFractionDigits={0}
                          />
                        </IntlProvider>
                      </span>
                      <span className="night-title">
                        <FormattedMessage
                          id="perNight"
                          defaultMessage="per night"
                        />
                      </span>
                    </div>
                    <button
                      className="select-package-btn"
                      onClick={() => handleSelect(null)}
                    >
                      <FormattedMessage
                        id="selectPackage"
                        defaultMessage="SELECT PACKAGE"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="rate-container">
                <span className="title">
                  <FormattedMessage
                    id="dealsAndPackages"
                    defaultMessage="Deals & Packages"
                  />
                </span>
                {isLoading ? (
                  <div
                    style={{
                      height: "145px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ClipLoader
                      color="black"
                      loading={isLoading}
                      size={80}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                      className="loader"
                    />
                  </div>
                ) : (
                  <div className="packages">
                    {promotions.length > 0 &&
                      promotions.map((promotion) => (
                        <div
                          key={promotion.promotionId}
                          className="standard-rate-container"
                        >
                          <div className="standard-rate-description-container">
                            <span className="standard-rate-title">
                              <FormattedMessage
                                id={promotion.promotionTitle.toLowerCase()}
                                defaultMessage={promotion.promotionTitle}
                              />
                            </span>
                            <span className="standard-rate-description">
                              <FormattedMessage
                                id={`${promotion.promotionTitle.toLowerCase()} description`}
                                defaultMessage={promotion.promotionDescription}
                              />
                            </span>
                          </div>
                          <div className="standard-rate">
                            <div className="price-container">
                              <span className="price">
                                <IntlProvider locale="en">
                                  <FormattedNumber
                                    style="currency"
                                    currency={currency}
                                    value={
                                      Math.ceil(
                                        room.price * promotion.priceFactor
                                      ) * rates[currency]
                                    }
                                    maximumFractionDigits={0}
                                  />
                                </IntlProvider>
                              </span>
                              <span className="night-title">
                                <FormattedMessage
                                  id="perNight"
                                  defaultMessage="per night"
                                />
                              </span>
                            </div>
                            <button
                              className="select-package-btn"
                              onClick={() => handleSelect(promotion)}
                            >
                              <FormattedMessage
                                id="selectPackage"
                                defaultMessage="SELECT PACKAGE"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="promo-code-container">
                <span className="title">
                  <FormattedMessage
                    id="promocodeTitle"
                    defaultMessage="Enter a promo code"
                  />
                </span>
                <div className="promo-code-input-container">
                  <input
                    type="text"
                    className="promo-code-input"
                    value={promocode}
                    onChange={changeInputPromocode}
                  />
                  <button className="apply-btn" onClick={handleApply}>
                    <FormattedMessage id="applyTitle" defaultMessage="APPLY" />
                  </button>
                </div>
              </div>
            </div>
            <div className="reviews-container">
              <span className="title">
                <FormattedMessage id="Reviews" defaultMessage="Reviews" />
              </span>
              {!isReviewLoading ? (
                <div
                  className="reviews"
                  style={{
                    maxHeight: `calc(450px + ${(promotions.length - 1) *
                      155}px)`,
                  }}
                >
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div className="review" key={review.username}>
                        <div className="user-info">
                          <div className="user-icon">
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name">{review.username}</span>
                        </div>
                        <div className="review-rating">
                          <Rating
                            name="hover-feedback"
                            size="medium"
                            value={review.rating}
                            readOnly
                          />
                          <span>{review.review}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span>
                      <FormattedMessage id="No reviews to show" defaultMessage="No reviews to show" />
                      .
                    </span>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    height: "145px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ClipLoader
                    color="black"
                    loading={isReviewLoading}
                    size={80}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="loader"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
