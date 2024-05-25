import { useDispatch, useSelector } from "react-redux";
import { GuestsDropdown } from "../../components/GuestsDropdown/GuestsDropdown";
import { RoomsDropdown } from "../../components/RoomsDropdown/RoomsDropdown";
import "./RoomResults.scss";
import { Fragment, useEffect, useRef, useState } from "react";
import { setCurrentConfig } from "../../redux/slices/AppSlice";
import { AppDispatch, RootState } from "../../redux/store/store";
import Calendar from "../../components/Calendar/Calendar";
import { getMinimumRates } from "../../redux/thunks/getMinimumRates";
import { Filter } from "../../components/Filter/Filter";
import { Dropdown } from "../../components/Dropdown/Dropdown";
import { Room } from "../../components/Room/Room";
import { closeDropdown, setDropdown } from "../../redux/slices/DropdownSlice";
import { Itinerary } from "../../components/Itinerary/Itinerary";
import { useMediaQuery } from "usehooks-ts";
import { getRooms } from "../../redux/thunks/getRooms";
import ClipLoader from "react-spinners/ClipLoader";
import { MUIStepper } from "../../components/Stepper/Stepper";
import { Link, useNavigate } from "react-router-dom";
import {
  calculateGuests,
  calculatePropertyId,
} from "../LandingPage/LandingPage";
import {
  setCounts,
  setEndDate,
  setSelectedRooms,
  setStartDate,
} from "../../redux/slices/LandingPageSlice";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import {
  setSelectedBeds,
  setSelectedRoomsToCompare,
  setStepperState,
} from "../../redux/slices/RoomResultsSlice";
import { Modal } from "@mui/material";
import { QueryParams } from "../../utils/interface";
import { monitorPageView } from "../../utils/ga";

export default function RoomResults() {
  const appState = useSelector((state: RootState) => state.app);
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const dropdownState = useSelector((state: RootState) => state.dropdown);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const roomResultsState = useSelector((state: RootState) => state.roomResults);
  const isSortActive = dropdownState.isSortActive;
  const isFilterActive = dropdownState.isFilterActive;
  const isMenuActive = dropdownState.isMenuActive;
  const startDate = landingPageState.startDate;
  const endDate = landingPageState.endDate;
  const selectedRooms = landingPageState.selectedRooms;
  const counts = landingPageState.counts;
  const selectedProperty = landingPageState.selectedProperty;
  const configData = appState.configData;
  const currentConfig = appState.currentConfig;
  const isCalendarActive = dropdownState.isCalendarActive;
  const minimumNightlyRates = landingPageState.minimumNightlyRates;
  const isItineraryActive = checkoutPageState.selectedItinerary !== null;
  const roomsList = roomResultsState.roomsList;
  const totalRecords = roomResultsState.totalRecords;
  const selectedBedTypes = roomResultsState.selectedBedTypes;
  const selectedRoomTypes = roomResultsState.selectedRoomTypes;
  const selectedPriceFilter = roomResultsState.selectedPriceFilter;
  const selectedCapacityFilter = roomResultsState.selectedCapacityFilter;
  const selectedAreaFilter = roomResultsState.selectedAreaFilter;
  const isLoading = roomResultsState.state === "pending";
  const selectedRoomsToCompare = roomResultsState.selectedRoomsToCompare;
  const selectedItinerary = checkoutPageState.selectedItinerary;
  const [selectedSort, setSelectedSort] = useState<string>("Select");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [queryParams, setQueryParams] = useState<QueryParams | null>(null);
  const [propertyId, setPropertyId] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showItinerary, setShowItinerary] = useState<boolean>(false);

  const navigate = useNavigate();
  const reduxDispatch: AppDispatch = useDispatch();
  const pageSize = currentConfig?.page_size;
  const currency = appState.currency;
  const rates = appState.rate;

  function extractQueryParams(url: string): QueryParams | null {
    const urlParams = new URLSearchParams(url);
    const queryParams: QueryParams = {
      property: "",
      startDate: "",
      endDate: "",
    };

    // Extract compulsory parameters
    if (urlParams.has("property")) {
      queryParams.property = urlParams.get("property")!;
    } else {
      // Handle missing 'property' parameter error
      return null;
    }

    if (urlParams.has("startDate")) {
      queryParams.startDate = urlParams.get("startDate")!;
    } else {
      // Handle missing 'start' parameter error
      return null;
    }

    if (urlParams.has("endDate")) {
      queryParams.endDate = urlParams.get("endDate")!;
    } else {
      // Handle missing 'end' parameter error
      return null;
    }

    // Extract optional parameters if they exist
    if (urlParams.has("room")) {
      queryParams.room = urlParams.get("room")!;
    }

    if (urlParams.has("seniors")) {
      queryParams.seniors = urlParams.get("seniors")!;
    }

    if (urlParams.has("adults")) {
      queryParams.adults = urlParams.get("adults")!;
    }

    if (urlParams.has("teens")) {
      queryParams.teens = urlParams.get("teens")!;
    }

    if (urlParams.has("kids")) {
      queryParams.kids = urlParams.get("kids")!;
    }
    return queryParams;
  }

  function isValidQueryParam(params: QueryParams): boolean {
    // Check if property is a number and greater than 1
    if (isNaN(Number(params.property)) || Number(params.property) <= 1) {
      return false;
    }

    // Check if start and end are in dd-mm-yyyy format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.startDate) || !dateRegex.test(params.endDate)) {
      return false;
    }

    // Convert start and end dates to Date objects
    const urlStartDate = new Date(params.startDate);
    const urlEndDate = new Date(params.endDate);

    // Check if start and end dates are valid dates
    if (isNaN(urlStartDate.getTime()) || isNaN(urlEndDate.getTime())) {
      return false;
    }

    // Check if start date is before end date
    if (urlStartDate.getTime() >= urlEndDate.getTime()) {
      return false;
    }

    // Check if start and end dates are within the next 6 months
    const currentDate = new Date();
    const yesterDayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1
    );
    const sixMonthsFromNow = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 6,
      currentDate.getDate()
    );
    if (
      urlStartDate.getTime() <= yesterDayDate.getTime() ||
      urlEndDate.getTime() <= yesterDayDate.getTime()
    ) {
      return false;
    }
    if (
      urlStartDate.getTime() > sixMonthsFromNow.getTime() ||
      urlEndDate.getTime() > sixMonthsFromNow.getTime()
    ) {
      return false;
    }

    // Check if room, adults, teens, and kids are numeric and greater than zero if provided
    if (
      params.room &&
      (isNaN(Number(params.room)) || Number(params.room) < 1)
    ) {
      return false;
    }

    if (
      params.seniors &&
      (isNaN(Number(params.seniors)) || Number(params.seniors) < 0)
    ) {
      return false;
    }

    if (
      params.adults &&
      (isNaN(Number(params.adults)) || Number(params.adults) < 1)
    ) {
      return false;
    }

    if (
      params.teens &&
      (isNaN(Number(params.teens)) || Number(params.teens) < 0)
    ) {
      return false;
    }

    if (
      params.kids &&
      (isNaN(Number(params.kids)) || Number(params.kids) < 0)
    ) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    const prevPath = localStorage.getItem("url");

    const currentUrlParams = window.location.search;

    if (
      (!prevPath || prevPath.length === 0) &&
      (!currentUrlParams || currentUrlParams.length === 0)
    ) {
      navigate("/");
    }

    if (
      !currentUrlParams ||
      currentUrlParams == "" ||
      currentUrlParams.length === 0
    ) {
      navigate("/rooms" + prevPath);
    }

    // logic
    const searchParams = window.location.search;
    const paramsObject = extractQueryParams(searchParams);

    if (!paramsObject) {
      navigate("/");
      return;
    }

    if (!isValidQueryParam(paramsObject)) {
      navigate("/");
      return;
    }

    setQueryParams(paramsObject);
    localStorage.setItem("url", currentUrlParams);
  }, [window.location.search]);

  useEffect(() => {
    if (
      !queryParams?.property ||
      !queryParams.startDate ||
      !queryParams.endDate
    ) {
      return;
    }

    const {
      property,
      startDate,
      endDate,
      room,
      seniors,
      adults,
      kids,
      teens,
    } = queryParams;

    setPropertyId(parseInt(property));
    const newCounts: { [key: string]: number } = {};
    if (adults !== null) {
      newCounts["Adults"] = parseInt(adults ?? "1");
      newCounts["Teens"] = parseInt(teens ?? "0");
      newCounts["Kids"] = parseInt(kids ?? "0");
      newCounts["Senior Citizens"] = parseInt(seniors ?? "0");
      reduxDispatch(setCounts(newCounts));
    }
    const totalCounts =
      parseInt(adults ?? "1") + parseInt(teens ?? "0") + parseInt(kids ?? "0");
    reduxDispatch(
      setSelectedBeds(Math.ceil(totalCounts / parseInt(room ?? "1")))
    );

    reduxDispatch(setStartDate(startDate));
    reduxDispatch(setEndDate(endDate));

    if (room) {
      reduxDispatch(setSelectedRooms(parseInt(room)));
    }
  }, [queryParams]);

  useEffect(() => {
    if (isItineraryActive) {
      reduxDispatch(setStepperState(1));
    } else {
      reduxDispatch(setStepperState(0));
    }
    if (!queryParams?.startDate || !queryParams?.endDate) {
      return;
    }

    if (typeof pageSize !== "undefined") {
      reduxDispatch(
        getRooms({
          startDate: queryParams.startDate,
          endDate: queryParams.endDate,
          propertyId,
          selectedBedTypes,
          selectedRoomTypes,
          selectedPriceFilter,
          selectedCapacityFilter,
          selectedAreaFilter,
          selectedSort,
          pageNumber,
          pageSize,
          totalCounts: getGuestsCount(),
          totalRoomsSelected: getRoomsCount(),
          totalBedsSelected: getBedsCount(),
        })
      );
      reduxDispatch(setSelectedRoomsToCompare([]));
    }
  }, [
    reduxDispatch,
    currentConfig,
    selectedAreaFilter,
    selectedBedTypes,
    selectedCapacityFilter,
    selectedPriceFilter,
    selectedRoomTypes,
    selectedSort,
    pageNumber,
    queryParams,
  ]);

  const filterRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutsideDropdown = (event: MouseEvent) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Filter"));
    }
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Calendar"));
    }
    if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
      reduxDispatch(closeDropdown("Sort"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, []);

  const handleCalendarDropdown = () => {
    reduxDispatch(setDropdown("Calendar"));
    if (Object.keys(minimumNightlyRates).length === 0) {
      reduxDispatch(getMinimumRates());
    }
  };

  const handleSortDropdown = () => {
    reduxDispatch(setDropdown("Sort"));
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    reduxDispatch(setDropdown("Sort"));
  };

  const handleFilterDropdown = () => {
    reduxDispatch(setDropdown("Filter"));
  };

  const handlePrevPage = () => {
    setPageNumber(pageNumber - 1);
  };

  const handleNextPage = () => {
    setPageNumber(pageNumber + 1);
  };

  const getRoomsCount = () => {
    return selectedRooms;
  };

  const getBedsCount = () => {
    return Math.ceil(
      Object.values(counts).reduce((total, count) => total + count, 0) /
        selectedRooms
    );
  };

  const getGuestsCount = () => {
    return Object.values(counts).reduce((total, count) => total + count, 0);
  };

  const handleSearch = () => {
    window.localStorage.setItem("url", JSON.stringify(window.location.search));
  };

  const handleItineraryClick = () => {
    setShowItinerary(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setShowItinerary(false);
  };

  const handleClearRoomsSelection = () => {
    reduxDispatch(setSelectedRoomsToCompare([]));
  };

  const handleCompareModal = () => {
    setShowModal(true);
  };

  useEffect(() => {
    const propertyName =
      propertyId !== null ? `Team ${propertyId} Hotel` : "Team 11 Hotel";
    const currentProperty = configData?.properties[propertyName];
    reduxDispatch(setCurrentConfig(currentProperty));
  }, [configData, propertyId, reduxDispatch]);

  useEffect(() => {
    if (typeof pageSize !== "undefined") {
      setTotalPages(Math.ceil(totalRecords / pageSize));
    }
  }, [totalRecords, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [totalRecords]);

  useEffect(() => {
    monitorPageView("/rooms", "Room Results Page");
  }, []);

  const sorts = currentConfig?.sort;
  const isMobileView = useMediaQuery("(max-width: 1060px)");
  const bannerImageUrl = configData?.banner_image_url;

  return (
    <div className="room-results-container">
      <div
        className="banner-image-container"
        style={
          configData && {
            backgroundImage: `url(${bannerImageUrl})`,
          }
        }
      ></div>
      <div className="navigation-links-container">
        <MUIStepper />
      </div>
      <div className="main-content">
        <div
          className={`search-parameters-container ${isMenuActive &&
            "search-parameters-container-menu"}`}
        >
          <div className="states-container">
            <GuestsDropdown multiple />
            <RoomsDropdown multiple />
            <RoomsDropdown multiple bed />
          </div>
          <div className="check-in-out-date-wrapper" ref={calendarRef}>
            <button
              className={`date-container ${isCalendarActive &&
                "date-container-active"}`}
              onClick={handleCalendarDropdown}
            >
              <div className="check-in-out-container">
                <div className="check-in-container">
                  <span className="check-in-out-title">
                    <FormattedMessage
                      id="checkInBetween"
                      defaultMessage="Check in between"
                    />
                  </span>
                  <span className="check-in-out-date">
                    {startDate
                      ? new Date(startDate).toDateString().substring(3)
                      : new Date(queryParams?.startDate ?? "")
                          .toDateString()
                          .substring(3)}
                  </span>
                </div>
                <div className="check-out-container">
                  <span className="check-in-out-title">
                    <FormattedMessage
                      id="checkOutBetween"
                      defaultMessage="Check out between"
                    />
                  </span>
                  <span className="check-in-out-date">
                    {endDate
                      ? new Date(endDate).toDateString().substring(3)
                      : new Date(queryParams?.endDate ?? "")
                          .toDateString()
                          .substring(3)}
                  </span>
                </div>
              </div>
              <img src="/icons/calendar-large.png" alt="calendar" />
            </button>
            {isCalendarActive && <Calendar right />}
          </div>
          <Link
            to={`/rooms?property=${calculatePropertyId(
              selectedProperty
            )}&startDate=${startDate}&endDate=${endDate}&${calculateGuests(
              counts
            )}&room=${selectedRooms}`}
            className="search-link"
          >
            <button className="search-dates-btn" onClick={handleSearch}>
              <FormattedMessage
                id="searchDates"
                defaultMessage="SEARCH DATES"
              />
            </button>
          </Link>
          <div className="filters-dropdown-wrapper" ref={filterRef}>
            <button
              className={`filters-dropdown-container ${isFilterActive &&
                "filters-active"}`}
              onClick={handleFilterDropdown}
            >
              <span className="filters-dropdown-title">
                <FormattedMessage
                  id="narrow"
                  defaultMessage="Narrow your results"
                />
              </span>
              <img
                src={
                  isFilterActive
                    ? "/icons/arrow-up-large.png"
                    : "/icons/arrow-down-large.png"
                }
                alt="arrow-down"
              />
            </button>
            {isFilterActive && <Filter absolute />}
          </div>
        </div>
        <div className="room-results">
          <div className="filters-container">
            <span className="filters-title">
              <FormattedMessage
                id="narrow"
                defaultMessage="Narrow your results"
              />
            </span>
            <Filter />
          </div>
          <div className="rooms-container">
            <div className="title-sort-container">
              <span className="room-results-title">
                <FormattedMessage
                  id="roomResults"
                  defaultMessage="Room results"
                />
              </span>
              <div className="sort-container">
                <div className="pagination">
                  <button
                    className={`prev-btn ${
                      pageNumber === 1 ? "btn-disabled" : ""
                    }`}
                    disabled={pageNumber === 1}
                    onClick={handlePrevPage}
                  >
                    <img src="/icons/prev-btn.png" alt="prev-btn" />
                  </button>
                  <span className="pagination-title">
                    {!isLoading && totalRecords > 0 && (
                      <>
                        <FormattedMessage
                          id="showing"
                          defaultMessage="Showing"
                        />
                        {` ${(pageNumber - 1) * pageSize + 1}-${Math.min(
                          pageNumber * pageSize,
                          totalRecords
                        )} of ${totalRecords} `}
                        <FormattedMessage
                          id="results"
                          defaultMessage="results"
                        />
                      </>
                    )}
                  </span>
                  <button
                    className={`next-btn ${
                      pageNumber === totalPages || totalRecords === 0
                        ? "btn-disabled"
                        : ""
                    }`}
                    disabled={pageNumber === totalPages}
                    onClick={handleNextPage}
                  >
                    <img src="/icons/next-btn.png" alt="next-btn" />
                  </button>
                </div>
                <div className="space"></div>
                <div className="sort-wrapper" ref={sortRef}>
                  <button className="sort" onClick={handleSortDropdown}>
                    <span className="sort-title">
                      <FormattedMessage
                        id={selectedSort.toLowerCase()}
                        defaultMessage={selectedSort}
                      />
                    </span>
                    <img src="/icons/arrow-down-large.png" alt="arrow-down" />
                  </button>
                  <div className="sort-dropdown-container">
                    {isSortActive && (
                      <Dropdown<string>
                        values={sorts
                          .filter((sort) => sort.active)
                          .map((sort) => sort.title)}
                        absolute
                        applyTranslation
                        onChange={handleSortChange}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="rooms-itinerary">
              <div
                className={`rooms ${isItineraryActive &&
                  !isMobileView &&
                  "rooms-active"}`}
              >
                {isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
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
                ) : roomsList?.length > 0 ? (
                  roomsList.map((room) => (
                    <Room key={room.roomTypeId} room={room} />
                  ))
                ) : (
                  <span className="no-rooms-title">
                    <FormattedMessage
                      id="noRooms"
                      defaultMessage="Oops! No rooms found. Please modify the dates/filters or try again later."
                    />
                  </span>
                )}
              </div>
              {isItineraryActive && !isMobileView && (
                <div className="itinerary">
                  <Itinerary />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isMobileView && selectedItinerary && (
        <>
          <div className="itinerary-floating-icon-container">
            <button
              className="itinerary-floating-icon"
              onClick={handleItineraryClick}
            >
              <img src="/icons/itinerary.png" alt="itinerary" />
            </button>
          </div>
          <Modal
            open={showItinerary}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className="modal">
              <div className="modal-container">
                <Itinerary />
                <button className="close-btn" onClick={handleClose}>
                  X
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
      {selectedRoomsToCompare.length > 1 && (
        <div className="compare-rooms">
          <button className="clear-btn" onClick={handleClearRoomsSelection}>
            <FormattedMessage
              id="clear Selection"
              defaultMessage="Clear Selection"
            />
          </button>
          <button className="compare-btn" onClick={handleCompareModal}>
            <FormattedMessage
              id="compare rooms"
              defaultMessage="COMPARE ROOMS"
            />
          </button>
        </div>
      )}
      <Modal
        open={showModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="modal compare-modal">
          {selectedRoomsToCompare.length > 1 && (
            <div className="modal-container compare-container">
              <span className="title">
                <FormattedMessage
                  id="comparison result"
                  defaultMessage="Room Comparison Result"
                />
              </span>
              <div className="image-container">
                <div></div>
                <div className="image">
                  <img
                    src={selectedRoomsToCompare[0].imageUrl}
                    alt="room-img"
                  />
                </div>
                <div className="image">
                  <img
                    src={selectedRoomsToCompare[1].imageUrl}
                    alt="room-img"
                  />
                </div>
              </div>
              <div className="entities-container">
                <div className="titles">
                  <span>
                    <FormattedMessage
                      id="room type"
                      defaultMessage="Room Type"
                    />
                  </span>
                  <span>
                    <FormattedMessage id="area" defaultMessage="Area" />
                  </span>
                  <span>
                    <FormattedMessage id="capacity" defaultMessage="Capacity" />
                  </span>
                  <span>
                    <FormattedMessage
                      id="double bed"
                      defaultMessage="Double Bed"
                    />
                  </span>
                  <span>
                    <FormattedMessage
                      id="single bed"
                      defaultMessage="Single Bed"
                    />
                  </span>
                  <span>
                    <FormattedMessage id="price" defaultMessage="Price" />
                  </span>
                  <span>
                    <FormattedMessage id="ratings" defaultMessage="Ratings" />
                  </span>
                  <span>
                    <FormattedMessage
                      id="available rooms"
                      defaultMessage="Available Rooms"
                    />
                  </span>
                </div>
                {selectedRoomsToCompare.map((selectedRoom) => (
                  <div className="entities" key={selectedRoom.roomTypeId}>
                    {roomsList
                      .filter(
                        (room) => room.roomTypeId === selectedRoom.roomTypeId
                      )
                      .map((room) => {
                        return (
                          <Fragment key={room.roomTypeId}>
                            <span>
                              <FormattedMessage
                                id={room.roomTypeName.toLowerCase()}
                                defaultMessage={room.roomTypeName}
                              />
                            </span>
                            <span>{room.areaInSquareFeet} sq ft</span>
                            <span>{room.maxCapacity}</span>
                            <span>{room.doubleBed}</span>
                            <span>{room.singleBed}</span>
                            <span>
                              <IntlProvider locale="en">
                                <FormattedNumber
                                  style="currency"
                                  currency={currency}
                                  value={room.price * rates[currency]}
                                  maximumFractionDigits={0}
                                />
                              </IntlProvider>
                            </span>
                            <span>{selectedRoom.ratings}</span>
                            <span className="last">{room.availableRooms}</span>
                          </Fragment>
                        );
                      })}
                  </div>
                ))}
              </div>
              <button className="close-btn" onClick={handleClose}>
                X
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
