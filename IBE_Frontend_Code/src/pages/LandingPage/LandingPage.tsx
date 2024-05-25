import "./LandingPage.scss";
import "react-datepicker/dist/react-datepicker.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Calendar from "../../components/Calendar/Calendar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store/store";
import {
  setIsMilitaryPersonnel,
  setIsWheelchairSelected,
  setSelectedProperty,
} from "../../redux/slices/LandingPageSlice";
import { FormattedMessage } from "react-intl";
import { Dropdown } from "../../components/Dropdown/Dropdown";
import {
  resetCurrentConfig,
  setCurrentConfig,
} from "../../redux/slices/AppSlice";
import { useNavigate } from "react-router-dom";
import { GuestsDropdown } from "../../components/GuestsDropdown/GuestsDropdown";
import { RoomsDropdown } from "../../components/RoomsDropdown/RoomsDropdown";
import { closeDropdown, setDropdown } from "../../redux/slices/DropdownSlice";
import { useEffect, useRef } from "react";
import { monitorEvent, monitorPageView } from "../../utils/ga";

export const calculatePropertyId = (selectedProperty: string) => {
  if (selectedProperty.length > 0) {
    return selectedProperty?.match(/\d+/)?.[0];
  }
  return 11;
};

export const calculateGuests = (counts: { [key: string]: number }) => {
  let guestsString = "";
  Object.keys(counts).forEach((key) => {
    if (counts[key] > 0 && key !== "Senior Citizens") {
      guestsString += `${key.toLowerCase()}=${counts[key]}&`;
    } else if (key === "Senior Citizens" && counts[key] > 0) {
      guestsString += `seniors=${counts[key]}&`;
    }
  });
  return guestsString.substring(0, guestsString.length - 1);
};

export function LandingPage() {
  const appState = useSelector((state: RootState) => state.app);
  const dropdownState = useSelector((state: RootState) => state.dropdown);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const isPropertyActive = dropdownState.isPropertyActive;
  const isCalendarActive = dropdownState.isCalendarActive;
  const isWheelchairSelected = landingPageState.isWheelchairSelected;
  const isMilitaryPersonnel = landingPageState.isMilitaryPersonnel;
  const startDate = landingPageState.startDate;
  const endDate = landingPageState.endDate;
  const configData = appState.configData;
  const currentConfig = appState.currentConfig;
  const counts = landingPageState.counts;
  const selectedProperty = landingPageState.selectedProperty;
  const selectedRooms = landingPageState.selectedRooms;
  const propertiesList = appState.propertiesList;

  const reduxDispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const propertyRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutsideDropdown = (event: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Calendar"));
    }
    if (
      propertyRef.current &&
      !propertyRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Property"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, []);

  useEffect(() => {
    monitorPageView("/", "Landing Page");
  }, []);

  const handlePropertyDropdown = () => {
    reduxDispatch(setDropdown("Property"));
  };

  const handleCalendarDropdown = () => {
    reduxDispatch(setDropdown("Calendar"));
  };

  const handlePropertyChange = (property: string) => {
    reduxDispatch(setSelectedProperty(property));

    if (
      property.length > 0 &&
      Object.keys(configData.properties).length > 0 &&
      property in configData.properties
    ) {
      reduxDispatch(setCurrentConfig(configData.properties[property]));
    } else {
      reduxDispatch(resetCurrentConfig());
    }
    reduxDispatch(setDropdown("Property"));
  };

  const handleCheckboxChange = () => {
    reduxDispatch(setIsWheelchairSelected(!isWheelchairSelected));
  };

  const handleMilitaryCheckboxChange = () => {
    reduxDispatch(setIsMilitaryPersonnel(!isMilitaryPersonnel));
  };

  const isButtonDisabled = () => {
    return selectedProperty.length === 0 || startDate === endDate;
  };

  const handleSearch = () => {
    monitorEvent("Room Search", "Room Searched", "Search");
    window.localStorage.setItem(
      "url",
      JSON.stringify(
        `?property=${calculatePropertyId(
          selectedProperty
        )}&startDate=${startDate}&endDate=${endDate}&${calculateGuests(
          counts
        )}&room=${selectedRooms}&bed=${selectedProperty}`
      )
    );
    navigate(
      `/rooms?property=${calculatePropertyId(
        selectedProperty
      )}&startDate=${startDate}&endDate=${endDate}&${calculateGuests(
        counts
      )}&room=${selectedRooms}`
    );
  };

  const allowedOptions = currentConfig ? currentConfig.allowed_options : null;
  const backgroundImageUrl = configData?.background_image_url;

  return (
    <div id="body-container">
      <div
        className="body-content"
        style={
          configData && {
            backgroundImage: `url(${backgroundImageUrl})`,
          }
        }
      >
        <div className="search-container">
          <div className="filters-container">
            <div className="property-wrapper" ref={propertyRef}>
              <div className="property-container">
                <span className="property-search-title">
                  <FormattedMessage
                    id="propertySearchTitle"
                    defaultMessage="Property name*"
                  />
                </span>
                <button
                  className={`property-search-container ${isPropertyActive &&
                    "property-search-container-active"}`}
                  onClick={handlePropertyDropdown}
                >
                  {selectedProperty.length === 0 ? (
                    <span className="property-title">
                      <FormattedMessage
                        id="propertyTitle"
                        defaultMessage="Search all properties"
                      />
                    </span>
                  ) : (
                    <FormattedMessage
                      id={selectedProperty.toLowerCase()}
                      defaultMessage={selectedProperty}
                    />
                  )}
                  <img
                    src={
                      isPropertyActive
                        ? "/icons/arrow-up.png"
                        : "/icons/arrow-down.png"
                    }
                    alt="down arrow"
                  />
                </button>
              </div>
              {isPropertyActive && (
                <Dropdown<string>
                  values={propertiesList}
                  onChange={handlePropertyChange}
                  applyTranslation
                  absolute
                />
              )}
            </div>
            <div className="date-wrapper" ref={calendarRef}>
              <div className="date-container">
                <span className="date-select-title">
                  <FormattedMessage
                    id="calendarHeading"
                    defaultMessage="Select dates"
                  />
                </span>
                <button
                  className={`date-select-container ${isCalendarActive &&
                    "date-active"}`}
                  onClick={handleCalendarDropdown}
                >
                  <div className="date-info">
                    <span>
                      {startDate ? (
                        startDate
                      ) : (
                        <FormattedMessage
                          id="checkIn"
                          defaultMessage="Check-in"
                        />
                      )}
                    </span>
                    <img src="/icons/arrow-right.png" alt="arrow right" />
                    <span>
                      {endDate ? (
                        endDate
                      ) : (
                        <FormattedMessage
                          id="checkOut"
                          defaultMessage="Check-out"
                        />
                      )}
                    </span>
                  </div>
                  <img src="/icons/calendar.png" alt="calendar icon" />
                </button>
              </div>
              {isCalendarActive && <Calendar />}
            </div>
            <div className="guests-rooms-container">
              {allowedOptions &&
                allowedOptions.length > 0 &&
                allowedOptions[0].active && <GuestsDropdown />}
              {allowedOptions &&
                allowedOptions.length > 0 &&
                allowedOptions[1].active && <RoomsDropdown />}
              {allowedOptions &&
                allowedOptions.length > 0 &&
                allowedOptions[2].active && (
                  <div className="wheelchair-container">
                    <div
                      className={`${
                        allowedOptions[0].active ? "" : "empty-container"
                      }`}
                    ></div>
                    <div
                      className={`wheelchair-title-container ${
                        allowedOptions[0].active
                          ? ""
                          : "wheelchair-title-container-no-guests"
                      } ${
                        allowedOptions[1].active && !allowedOptions[0].active
                          ? "wheelchair-title-container-rooms"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="wheelchair"
                        id="wheelchair-checkbox"
                        checked={isWheelchairSelected}
                        onChange={handleCheckboxChange}
                      />
                      <span></span>
                      <img src="/icons/wheelchair.png" alt="wheelchair icon" />
                      <span></span>
                      <span className="wheelchair-title">
                        <FormattedMessage
                          id="wheelchairTitle"
                          defaultMessage="I need an Accessible Room"
                        />
                      </span>
                    </div>
                  </div>
                )}
              {allowedOptions && allowedOptions.length > 0 && (
                <div className="wheelchair-container military">
                  <div className="wheelchair-title-container">
                    <input
                      type="checkbox"
                      name="military"
                      id="military-checkbox"
                      checked={isMilitaryPersonnel}
                      onChange={handleMilitaryCheckboxChange}
                    />
                    <img src="/icons/military.png" alt="military icon" />
                    <span className="wheelchair-title">
                      <FormattedMessage
                        id="militaryTitle"
                        defaultMessage="I am a Military Personnel"
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            className={`search-btn ${isButtonDisabled() &&
              "search-btn-disabled"}`}
            disabled={isButtonDisabled()}
            onClick={handleSearch}
          >
            <FormattedMessage
              id="searchButtonContent"
              defaultMessage="SEARCH"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
