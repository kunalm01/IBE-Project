import { createAsyncThunk } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { setState } from "../slices/CheckoutPageSlice";

export interface CostDTO {
  totalCost: number;
  amountDueAtResort: number;
  nightlyRate: number;
  taxes: number;
  vat: number;
}

export interface PromotionDTO {
  promotionId: number;
  promotionTitle: string;
  priceFactor: number;
  promotionDescription: string;
}

export interface GuestDTO {
  firstName: string;
  lastName: string;
  phone: string;
  emailId: string;
  hasSubscribed: boolean;
}

export interface BillingDTO {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zipcode: string;
  state: string;
  country: string;
  phone: string;
  emailId: string;
}

export interface PaymentDTO {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface BookingRequestDTO {
  startDate: string;
  endDate: string;
  roomCount: number;
  adultCount: number;
  teenCount?: number;
  kidCount?: number;
  seniorCount?: number;
  tenantId: number;
  propertyId: number;
  roomTypeId: number;
  roomName: string;
  roomImageUrl: string;
  costInfo: CostDTO;
  promotionInfo: PromotionDTO;
  guestInfo: GuestDTO;
  billingInfo: BillingDTO;
  paymentInfo: PaymentDTO;
}

export const postBooking = createAsyncThunk(
  "postBooking",
  async (bookingRequestDto: BookingRequestDTO) => {
    try {
      const response = await fetch(
        "https://team-11-ibe-apim.azure-api.net/api/v1/create-booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingRequestDto),
        }
      );
      if (!response.ok) {
        const reduxDispatch = useDispatch();
        reduxDispatch(setState("error"));
        throw new Error("Error while fetching config data");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Error while fetching config data");
    }
  }
);
