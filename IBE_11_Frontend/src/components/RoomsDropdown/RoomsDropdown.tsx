import { FormattedMessage } from "react-intl";
import "./RoomsDropdown.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import {
  setCounts,
  setSelectedRooms,
} from "../../redux/slices/LandingPageSlice";
import { Dropdown } from "../Dropdown/Dropdown";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { closeDropdown, setDropdown } from "../../redux/slices/DropdownSlice";
import { setSelectedBeds } from "../../redux/slices/RoomResultsSlice";
import { useEffect, useRef } from "react";
import { RoomsDropdownProps } from "../../utils/interface";

export function RoomsDropdown({ multiple, bed }: Readonly<RoomsDropdownProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const dropdownState = useSelector((state: RootState) => state.dropdown);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const roomResultsState = useSelector((state: RootState) => state.roomResults);
  const isRoomActive = dropdownState.isRoomActive;
  const isBedActive = dropdownState.isBedActive;
  const counts = landingPageState.counts;
  const selectedRooms = landingPageState.selectedRooms;
  const allowedRoomCounts = landingPageState.allowedRoomCounts;
  const currentConfig = appState.currentConfig;
  const selectedBeds = roomResultsState.selectedBeds;
  const allowedBedCounts = roomResultsState.allowedBedCounts;

  const reduxDispatch = useDispatch();

  const roomsRef = useRef<HTMLDivElement | null>(null);
  const bedsRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutsideDropdown = (event: MouseEvent) => {
    if (roomsRef.current && !roomsRef.current.contains(event.target as Node)) {
      reduxDispatch(closeDropdown("Room"));
    }
    if (bedsRef.current && !bedsRef.current.contains(event.target as Node)) {
      reduxDispatch(closeDropdown("Bed"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, []);

  const handleDropdown = () => {
    if (bed) {
      reduxDispatch(setDropdown("Bed"));
    } else {
      reduxDispatch(setDropdown("Room"));
    }
  };

  const isActive = () => {
    if (bed) {
      return isBedActive;
    }
    return isRoomActive;
  };

  const handleRoomChange = (noOfRooms: number) => {
    const totalCounts = Object.values(counts).reduce(
      (total, count) => total + count,
      0
    );
    reduxDispatch(setSelectedRooms(noOfRooms));
    if (counts["Adults"] < noOfRooms) {
      reduxDispatch(setCounts({ ...counts, ["Adults"]: noOfRooms }));
    }
    if (totalCounts > noOfRooms * maximumAllowedGuestsInARoom) {
      reduxDispatch(
        setCounts({
          ["Adults"]: noOfRooms,
          ["Teens"]: 0,
          ["Kids"]: 0,
          ["Senior Citizens"]: 0,
        })
      );
      reduxDispatch(
        showSnackbar({
          message:
            "Maximum allowed guests in selected room count threshold reached! Reseting values...",
          type: "error",
        })
      );
    }
    reduxDispatch(setSelectedBeds(Math.ceil(totalCounts / noOfRooms)));
    reduxDispatch(setDropdown("Room"));
  };

  const handleBedChange = (noOfBeds: number) => {
    const totalCounts = Object.values(counts).reduce(
      (total, count) => total + count,
      0
    );
    const newNoOfRooms = Math.ceil(totalCounts / noOfBeds);
    if(newNoOfRooms <= counts["Adults"]){
      reduxDispatch(setSelectedBeds(noOfBeds));
      reduxDispatch(setSelectedRooms(newNoOfRooms));
    }
    else{
      reduxDispatch(
        showSnackbar({
          message: "Increase adults count to select this option!",
          type: "error",
        })
      );
    }
    reduxDispatch(setDropdown("Bed"));
  };

  const urlParams = new URLSearchParams(window.location.search);
  const roomCount = urlParams.get("room");

  useEffect(() => {
    if (roomCount !== null) {
      reduxDispatch(setSelectedRooms(parseInt(roomCount)));
    }
  }, [roomCount, reduxDispatch]);

  const maximumAllowedGuestsInARoom = currentConfig
    ? currentConfig.maximum_guests_in_a_room
    : 4;

  return (
    <div
      className={`rooms-wrapper ${multiple && "rooms-wrapper-large"}`}
      ref={bed ? bedsRef : roomsRef}
    >
      <div className="rooms-container">
        {!multiple && (
          <span className="rooms-title">
            <FormattedMessage id="roomsTitle" defaultMessage="Rooms" />
          </span>
        )}
        <button
          className={`rooms-info ${isActive() && "rooms-active"}`}
          onClick={handleDropdown}
        >
          <div className={`${multiple && "rooms-string"}`}>
            {multiple && (
              <span className="rooms-heading">
                {bed ? (
                  <FormattedMessage id="bedsTitle" defaultMessage="Beds" />
                ) : (
                  <FormattedMessage id="roomsTitle" defaultMessage="Rooms" />
                )}
              </span>
            )}
            <span className="rooms-state">
              {bed ? selectedBeds : selectedRooms}
            </span>
          </div>
          <img
            src={
              multiple
                ? isActive()
                  ? "/icons/arrow-up-large.png"
                  : "/icons/arrow-down-large.png"
                : isActive()
                ? "/icons/arrow-up.png"
                : "/icons/arrow-down.png"
            }
            alt="down arrow"
            className="arrow-icon"
          />
        </button>
      </div>
      {isActive() && (
        <Dropdown<number>
          values={isBedActive ? allowedBedCounts : allowedRoomCounts}
          onChange={isBedActive ? handleBedChange : handleRoomChange}
          absolute
        />
      )}
    </div>
  );
}
