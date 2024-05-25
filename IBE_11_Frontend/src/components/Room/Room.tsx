import { useDispatch, useSelector } from "react-redux";
import { ImageCarousel } from "../Carousel/Carousel";
import "./Room.scss";
import { RootState } from "../../redux/store/store";
import { useMediaQuery } from "usehooks-ts";
import { IDataResponse, RoomProps } from "../../utils/interface";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import {
  setSelectedModal,
  setSelectedRoomsToCompare,
  setStepperState,
} from "../../redux/slices/RoomResultsSlice";
import { RoomModal } from "../RoomModal/RoomModal";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { Modal } from "@mui/material";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { monitorEvent } from "../../utils/ga";

export function Room({ room }: Readonly<RoomProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const roomResultsState = useSelector((state: RootState) => state.roomResults);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const isItineraryActive = checkoutPageState.selectedItinerary !== null;
  const tenantId = appState.configData.tenant_id;
  const currency = appState.currency;
  const rates = appState.rate;
  const subscription = appState.subscription;
  const currentConfig = appState.currentConfig;
  const startDate = landingPageState.startDate;
  const endDate = landingPageState.endDate;
  const counts = landingPageState.counts;
  const isMilitaryPersonnel = landingPageState.isMilitaryPersonnel;
  const selectedRoomsToCompare = roomResultsState.selectedRoomsToCompare;
  const isSeniorCitizensActive = currentConfig?.allowed_guests.filter(
    (guest) => guest.title === "Senior Citizens"
  )[0].active;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<IDataResponse>();
  const reduxDispatch = useDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);

  const openModal = () => {
    monitorEvent("Room Modal Open", `${room.roomTypeName} Modal Opened` , "Modal Open");
    reduxDispatch(setSelectedModal(room.roomTypeName));
    reduxDispatch(setStepperState(1));
  };

  const open360Modal = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleCompareRooms = (checked: boolean) => {
    if (!checked && selectedRoomsToCompare.length > 1) {
      reduxDispatch(
        showSnackbar({
          message: "You can select only 2 rooms at max to compare",
          type: "info",
        })
      );
      return;
    }
    if (checked) {
      reduxDispatch(
        setSelectedRoomsToCompare(
          selectedRoomsToCompare.filter(
            (selectedRoom) => selectedRoom.roomTypeId !== room.roomTypeId
          )
        )
      );
    } else {
      reduxDispatch(
        setSelectedRoomsToCompare([
          ...selectedRoomsToCompare,
          {
            roomTypeId: room.roomTypeId,
            imageUrl: data?.roomImages[0] ?? "",
            ratings: data?.rating ?? 0,
          },
        ])
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://team-11-ibe-apim.azure-api.net/api/v1/room-data/${tenantId}/${room.roomTypeId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              startDate,
              endDate,
              seniorCitizen:
                isSeniorCitizensActive && counts["Senior Citizens"] > 0,
              military: isMilitaryPersonnel,
              kduMembership: subscription >= 1,
            }),
          }
        );
        const roomData = await response.json();
        setData(roomData);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [room]);

  const isMobileView = useMediaQuery("(max-width: 1060px)");
  return (
    <div
      className={`room ${isItineraryActive && !isMobileView && "room-active"}`}
    >
      <div className="room-images">
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
          <ImageCarousel
            images={typeof data !== "undefined" ? data.roomImages : [""]}
            height={145}
          />
        )}
      </div>
      <div className="room-details">
        <div className="room-info">
          <div className="room-name-review">
            <div className="room-name">
              <FormattedMessage
                id={room.roomTypeName.toLowerCase()}
                defaultMessage={room.roomTypeName}
              />
            </div>
            <div className="room-review">
              {isLoading ? (
                <ClipLoader
                  color="black"
                  loading={isLoading}
                  size={30}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                  className="loader"
                />
              ) : (
                <>
                  {typeof data !== "undefined" && data?.totalReviews > 0 ? (
                    <>
                      <div className="rating-container">
                        <img
                          src="/icons/star.png"
                          alt="star"
                          className="star-icon"
                        />
                        <span className="rating">&nbsp;{data?.rating}</span>
                      </div>
                      <span className="total-reviews">
                        {data?.totalReviews}{" "}
                        <FormattedMessage
                          id="reviews"
                          defaultMessage="reviews"
                        />
                      </span>
                    </>
                  ) : (
                    <div className="new-property">
                      <FormattedMessage
                        id="newProperty"
                        defaultMessage="New property"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="location">
            <img src="/icons/location.png" alt="location" />
            <span className="address">
              &nbsp;{" "}
              <FormattedMessage
                id="address"
                defaultMessage="Kickdrum, Koramangala 3rd Block"
              />
            </span>
          </div>
          <div className="inclusives">
            <span className="inclusive">
              <FormattedMessage id="inclusive" defaultMessage="Inclusive" />{" "}
              <span className="area">
                &nbsp; &nbsp;{room.areaInSquareFeet} ft<sup>2</sup>
              </span>
            </span>
            <div className="users-bed">
              <img src="/icons/user.png" alt="user" />
              <span>&nbsp; 1-{room.maxCapacity}</span>
            </div>
            <div className="users-bed">
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
          </div>
        </div>
        <div className="room-price">
          {data?.bestPromotion && (
            <div className="discount-container">
              <svg
                className="deal-tag"
                width="121"
                height="32"
                viewBox="0 0 121 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M120.759 0H0V32H120.759L112.775 14.9677L120.759 0Z"
                  fill="#26266D"
                />
              </svg>
              <div className="deal">
                <FormattedMessage
                  id="dealTitle"
                  defaultMessage="Special deal"
                />
              </div>
              <span className="deal-info">
                <FormattedMessage
                  id={data?.bestPromotion.promotionTitle.toLowerCase()}
                  defaultMessage={data?.bestPromotion.promotionTitle}
                />
              </span>
            </div>
          )}
          <div className="price-per-night">
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
            <span className="per-night">
              <FormattedMessage id="perNight" defaultMessage="per night" />
            </span>
          </div>
          <div className="button-compare">
            <div className="btns">
              <button className="select-room-btn" onClick={openModal}>
                <FormattedMessage
                  id="selectRoom"
                  defaultMessage="SELECT ROOM"
                />
              </button>
              <button className="view-btn" onClick={open360Modal}>
                360°
              </button>
            </div>
            <div className="compare">
              <input
                type="checkbox"
                name={`compare${room.roomTypeId}`}
                id={`compare${room.roomTypeId}`}
                checked={selectedRoomsToCompare.some(
                  (selectedRoom) => room.roomTypeId === selectedRoom.roomTypeId
                )}
                onChange={() =>
                  handleCompareRooms(
                    selectedRoomsToCompare.some(
                      (selectedRoom) =>
                        room.roomTypeId === selectedRoom.roomTypeId
                    )
                  )
                }
              />
              <label htmlFor={`compare${room.roomTypeId}`}>
                <FormattedMessage id="compare" defaultMessage="Compare" />
              </label>
            </div>
          </div>
          {room.availableRooms <= 4 && (
            <div className="filling-out">
              <img src="/icons/flame.png" alt="flame" />
              <span><FormattedMessage id="filling out fast" defaultMessage="Filling out fast" />...</span>
            </div>
          )}
          {typeof data !== "undefined" && <RoomModal room={room} data={data} />}
        </div>
      </div>
      <Modal
        open={showModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="image-modal">
          <ReactPhotoSphereViewer
            src={`/images/img${room.roomTypeId}.webp`}
            height={"80vh"}
            width={"100%"}
            littlePlanet={false}
          ></ReactPhotoSphereViewer>
          <button className="close-modal-btn" onClick={handleClose}>
            X
          </button>
        </div>
      </Modal>
    </div>
  );
}
