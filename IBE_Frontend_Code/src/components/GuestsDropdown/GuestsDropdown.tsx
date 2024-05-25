import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { Counter } from "../Counter/Counter";
import {
  setCounts,
  setSelectedGuests,
} from "../../redux/slices/LandingPageSlice";
import "./GuestsDropdown.scss";
import { useEffect, useRef } from "react";
import { closeDropdown, setDropdown } from "../../redux/slices/DropdownSlice";
import { setSelectedBeds } from "../../redux/slices/RoomResultsSlice";
import { GuestsDropdownProps } from "../../utils/interface";

export function GuestsDropdown({ multiple }: GuestsDropdownProps) {
  const appState = useSelector((state: RootState) => state.app);
  const dropdownState = useSelector((state: RootState) => state.dropdown);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const currentConfig = appState.currentConfig;
  const locale = appState.locale;
  const isGuestActive = dropdownState.isGuestActive;
  const selectedGuests = landingPageState.selectedGuests;
  const selectedRooms = landingPageState.selectedRooms;
  const counts = landingPageState.counts;

  const reduxDispatch = useDispatch();
  const guestRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutsideDropdown = (event: MouseEvent) => {
    if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
      reduxDispatch(closeDropdown("Guest"));
    }
  };

  const handleDropdown = () => {
    reduxDispatch(setDropdown("Guest"));
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, []);

  const allowedOptions = currentConfig ? currentConfig.allowed_options : null;
  const allowedGuests = currentConfig ? currentConfig.allowed_guests : null;

  useEffect(() => {
    const changeSelectedGuests = () => {
      let guestsString = "";
      type MyMap = {
        [key: string]: string;
      };

      const map: MyMap = {
        Adult: "Adulto",
        Teen: "Adolescente",
        Kid: "Niño",
      };

      if (allowedGuests && allowedGuests.length > 0) {
        allowedGuests.forEach((guest) => {
          const guestType = guest.title.substring(0, guest.title.length - 1);
          const guestValue = locale === "en" ? guestType : map[guestType];
          if (counts[guest.title] > 0) {
            if (counts[guest.title] === 1) {
              guestsString += `${counts[guest.title]} ${guestValue},`;
            } else {
              guestsString += `${counts[guest.title]} ${guestValue}s,`;
            }
          }
        });
        if (guestsString.length === 0) {
          guestsString = "Guests";
        }
        if (guestsString.endsWith(",")) {
          guestsString = guestsString.substring(0, guestsString.length - 1);
          guestsString = guestsString.trim();
        }
      }
      reduxDispatch(setSelectedGuests(guestsString));
      const totalCounts = Object.values(counts).reduce(
        (total, count) => total + count,
        0
      );
      reduxDispatch(setSelectedBeds(Math.ceil(totalCounts / selectedRooms)));
    };
    changeSelectedGuests();
  }, [counts, allowedGuests, reduxDispatch, locale]);

  useEffect(() => {
    if (allowedGuests && allowedGuests.length > 0) {
      const newCounts: { [key: string]: number } = {};
      const totalCounts = Object.values(counts).reduce(
        (total, count) => total + count,
        0
      );
      if (totalCounts === 0) {
        allowedGuests.forEach((guest) => {
          newCounts[guest.title] = guest.title === "Adults" ? 1 : 0;
        });
        if (newCounts["Adults"] < selectedRooms) {
          newCounts["Adults"] = selectedRooms;
        }
        reduxDispatch(setCounts(newCounts));
      }
    }
  }, [allowedGuests, reduxDispatch]);

  return (
    <div
      className={`guests-wrapper ${multiple && "guests-wrapper-large"}`}
      ref={guestRef}
    >
      <div
        className={`guests-container ${
          allowedOptions && !allowedOptions[1]?.active
            ? "guests-container-no-rooms"
            : ""
        }`}
      >
        {!multiple && (
          <span className="guests-title">
            <FormattedMessage id="guestsTitle" defaultMessage="Guests" />
          </span>
        )}
        <button
          className={`guests-info ${isGuestActive && "guests-active"}`}
          onClick={handleDropdown}
        >
          <div className={`${multiple ? "guests-string" : 'guests-string-single'}`}>
            {multiple && (
              <span className="guests-heading">
                <FormattedMessage id="guestsTitle" defaultMessage="Guests" />
              </span>
            )}
            <div className="guests-state">{selectedGuests}</div>
          </div>
          <img
            src={
              multiple
                ? isGuestActive
                  ? "/icons/arrow-up-large.png"
                  : "/icons/arrow-down-large.png"
                : isGuestActive
                ? "/icons/arrow-up.png"
                : "/icons/arrow-down.png"
            }
            alt="down arrow"
            className="arrow-icon"
          />
        </button>
      </div>
      {isGuestActive && (
        <div className="guests-dropdown-container">
          <div className="guests-select-container">
            {allowedGuests &&
              allowedGuests.length > 0 &&
              allowedGuests.map(
                (guest) =>
                  guest.active && (
                    <div key={guest.title} className="adults-container">
                      <div className="adults-titles">
                        <span className="adults-title">
                          <FormattedMessage
                            id={`${guest.title.toLowerCase()}Title`}
                            defaultMessage={guest.title}
                          />
                        </span>
                        <span className="adults-age">
                          <FormattedMessage id="ages" defaultMessage="Ages" />
                          &nbsp;
                          {guest.age}
                        </span>
                      </div>
                      <Counter guestType={guest.title} />
                    </div>
                  )
              )}
          </div>
        </div>
      )}
    </div>
  );
}
