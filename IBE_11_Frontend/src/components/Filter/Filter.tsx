import { useState } from "react";
import { Dropdown } from "../Dropdown/Dropdown";
import "./Filter.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedAreaFilter,
  setSelectedBedTypes,
  setSelectedCapacityFilter,
  setSelectedPriceFilter,
  setSelectedRoomTypes,
} from "../../redux/slices/RoomResultsSlice";
import { RootState } from "../../redux/store/store";
import { FormattedMessage } from "react-intl";
import { FilterProps } from "../../utils/interface";

export function Filter({ absolute }: Readonly<FilterProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const roomResultsState = useSelector((state: RootState) => state.roomResults);
  const currentConfig = appState.currentConfig;
  const selectedBedTypes = roomResultsState.selectedBedTypes;
  const selectedRoomTypes = roomResultsState.selectedRoomTypes;
  const selectedPriceFilter = roomResultsState.selectedPriceFilter;
  const selectedCapacityFilter = roomResultsState.selectedCapacityFilter;
  const selectedAreaFilter = roomResultsState.selectedAreaFilter;
  const filters = currentConfig?.filters;
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string>("");
  const [isBedActive, setIsBedActive] = useState<boolean>(false);
  const [isRoomTypeActive, setIsRoomTypeActive] = useState<boolean>(false);
  const [isPriceActive, setIsPriceActive] = useState<boolean>(false);

  const reduxDispatch = useDispatch();

  const handleDropdown = (type: string) => {
    if (activeFilterDropdown.length > 0 && activeFilterDropdown === type) {
      setActiveFilterDropdown("");
    } else {
      setActiveFilterDropdown(type);
    }
    setIsBedActive(type === "Bed" ? !isBedActive : false);
    setIsRoomTypeActive(type === "Room" ? !isRoomTypeActive : false);
    setIsPriceActive(type === "Price" ? !isPriceActive : false);
  };

  const passCheckFunction = (type: string) => {
    if (type === "Bed Type") {
      return handleBedTypeCheck;
    } else if (type === "Room Type") {
      return handleRoomTypeCheck;
    }
  };

  const passRadioFunction = (type: string) => {
    if (type === "Price") {
      return handlePricesCheck;
    } else if (type === "Min Capacity") {
      return handleCapacityCheck;
    } else if (type === "Min Area") {
      return handleAreaCheck;
    }
  };

  const passState = (type: string) => {
    if (type === "Price") {
      return selectedPriceFilter;
    } else if (type === "Min Capacity") {
      return selectedCapacityFilter;
    } else if (type === "Min Area") {
      return selectedAreaFilter;
    }
  };

  const handleBedTypeCheck = (bedType: string, remove: boolean) => {
    if (remove) {
      reduxDispatch(
        setSelectedBedTypes(selectedBedTypes.filter((bed) => bed !== bedType))
      );
    } else {
      reduxDispatch(setSelectedBedTypes([...selectedBedTypes, bedType]));
    }
  };

  const handleRoomTypeCheck = (roomType: string, remove: boolean) => {
    if (remove) {
      reduxDispatch(
        setSelectedRoomTypes(
          selectedRoomTypes.filter((room) => room !== roomType)
        )
      );
    } else {
      reduxDispatch(setSelectedRoomTypes([...selectedRoomTypes, roomType]));
    }
  };

  const handlePricesCheck = (price: string, remove: boolean) => {
    if (remove) {
      reduxDispatch(setSelectedPriceFilter(""));
    } else {
      reduxDispatch(setSelectedPriceFilter(price));
    }
  };

  const handleCapacityCheck = (capacity: string, remove: boolean) => {
    if (remove) {
      reduxDispatch(setSelectedCapacityFilter(""));
    } else {
      reduxDispatch(setSelectedCapacityFilter(capacity));
    }
  };

  const handleAreaCheck = (area: string, remove: boolean) => {
    if (remove) {
      reduxDispatch(setSelectedAreaFilter(""));
    } else {
      reduxDispatch(setSelectedAreaFilter(area));
    }
  };

  const isCheckbox = (type: string) => {
    return type === "Bed Type" || type === "Room Type";
  };

  return (
    <div className={`filter-container ${absolute && "filter-absolute"}`}>
      {filters?.map(
        (filter) =>
          filter.active && (
            <div
              key={filter.name}
              className={`filter-wrapper ${
                filter === filters[filters.length - 1] && "last-filter"
              }`}
            >
              <button
                className={`filter ${
                  activeFilterDropdown === filter.name && "filter-active"
                }`}
                onClick={() => handleDropdown(filter.name)}
              >
                <span className="filter-title">
                  <FormattedMessage
                    id={filter.name.toLowerCase()}
                    defaultMessage={filter.name}
                  />
                </span>
                <img
                  src={
                    activeFilterDropdown === filter.name
                      ? "/icons/arrow-up-large.png"
                      : "/icons/arrow-down-large.png"
                  }
                  alt="arrow-down"
                />
              </button>
              <div className="filter-dropdown">
                {activeFilterDropdown === filter.name &&
                  isCheckbox(filter.name) && (
                    <Dropdown<string>
                      values={filter.values
                        .filter((value) => value.active)
                        .map((value) => value.title)}
                      checkbox
                      filterValues={
                        filter.name === "Room Type"
                          ? selectedRoomTypes
                          : selectedBedTypes
                      }
                      handleCheck={passCheckFunction(filter.name)}
                      applyTranslation={
                        filter.name === "Bed Type" ||
                        filter.name === "Room Type"
                      }
                    />
                  )}
                {activeFilterDropdown === filter.name &&
                  !isCheckbox(filter.name) && (
                    <Dropdown<string>
                      values={filter.values
                        .filter((value) => value.active)
                        .map((value) => value.title)}
                      radio
                      current={passState(filter.name)}
                      handleRadio={passRadioFunction(filter.name)}
                    />
                  )}
              </div>
            </div>
          )
      )}
    </div>
  );
}
