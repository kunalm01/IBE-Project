import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { getRoomUrl } from "../../utils/constants";

interface IGetRooms {
  startDate: string;
  endDate: string;
  propertyId: number;
  selectedBedTypes: string[];
  selectedRoomTypes: string[];
  selectedPriceFilter: string;
  selectedCapacityFilter: string;
  selectedAreaFilter: string;
  selectedSort: string;
  pageNumber: number;
  pageSize: number;
  totalCounts: number;
  totalRoomsSelected: number;
  totalBedsSelected: number;
}

const getSelectedSort = (selectedSort: string) => {
  if(selectedSort === 'Name A-Z'){
    return 'Name Asc';
  }
  else if(selectedSort === 'Name Z-A'){
    return 'Name Desc';
  }
  return selectedSort;
}
export const getRooms = createAsyncThunk(
  "getRooms",
  async ({
    startDate,
    endDate,
    propertyId,
    selectedBedTypes,
    selectedRoomTypes,
    selectedPriceFilter,
    selectedCapacityFilter,
    selectedAreaFilter,
    selectedSort,
    pageNumber,
    pageSize,
    totalCounts,
    totalRoomsSelected,
    totalBedsSelected,
  }: IGetRooms) => {
    try {
      const url = getRoomUrl(pageNumber, pageSize);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          propertyId,
          roomTypeName:
            selectedRoomTypes.length === 1
              ? selectedRoomTypes[0].toUpperCase()
              : "",
          singleBed: selectedBedTypes.includes("Queen") ? 1 : 0,
          doubleBed: selectedBedTypes.includes("King") ? 1 : 0,
          area:
            selectedAreaFilter.length > 0
              ? parseInt(selectedAreaFilter.substring(0, 3))
              : 0,
          minCapacity:
            selectedCapacityFilter.length > 0
              ? parseInt(selectedCapacityFilter)
              : 0,
          maxPrice:
            selectedPriceFilter.length > 0
              ? parseInt(selectedPriceFilter.substring(2))
              : 0,
          sort: getSelectedSort(selectedSort),
          totalCounts,
          totalRoomsSelected,
          totalBedsSelected,
        }),
      });
      const data = await response.json();
      return data;
    } catch {
      isRejectedWithValue("Error while fetching room data");
    }
  }
);
