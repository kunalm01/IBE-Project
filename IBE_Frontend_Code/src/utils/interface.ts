import { ReactNode } from "react";

export interface CalendarProps {
  readonly right?: boolean;
}

export interface CounterProps {
  readonly guestType: string;
}

export interface DropdownProps<T extends ReactNode> {
  readonly values: T[];
  readonly onChange?: (selectedValue: T) => void;
  readonly absolute?: boolean;
  readonly checkbox?: boolean;
  readonly filterValues?: T[];
  readonly handleCheck?: (checkedValue: T, remove: boolean) => void;
  readonly radio?: boolean;
  readonly current?: T;
  readonly handleRadio?: (checkedValue: T, remove: boolean) => void;
  readonly applyTranslation?: boolean;
}

export interface IDropdownItem {
  name: string;
  symbol: string;
}

export interface IDateRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

export interface IRate {
  [key: string]: number;
}

export interface IGuest {
  title: string;
  age: string;
  active: boolean;
}

export interface IOption {
  title: string;
  active: boolean;
}

export interface ILanguage {
  name: string;
  symbol: string;
}

export interface ICurrency {
  name: string;
  symbol: string;
}

export interface ITranslation {
  [key: string]: {
    appName: string;
    login: string;
    price: string;
    bookings: string;
    footer: string;
    apiResponse: string;
    calendarHeading: string;
    calendarButton: string;
    endDateSelectMessage: string;
    days: string;
    propertySearchTitle: string;
    propertyTitle: string;
    guestsTitle: string;
    ages: string;
    roomsTitle: string;
    wheelchairTitle: string;
    searchButtonContent: string;
    adultsTitle: string;
    teensTitle: string;
    kidsTitle: string;
  };
}

export interface IConfig {
  tenant_id: number;
  tenant_header_logo_url: string;
  tenant_footer_logo_url: string;
  tenant_mini_logo_url: string;
  tenant_name: string;
  tenant_full_name: string;
  application_title: string;
  background_image_url: string;
  banner_image_url: string;
  supported_languages: ILanguage[];
  supported_currencies: ICurrency[];
  language_wise_currency: { [key: string]: string };
  properties: { [key: string]: IConfigProperty };
}

export interface IProperty {
  property_name: string;
}

export interface IConfigProperty {
  property_id: number;
  filters: IFilter[];
  sort: IOption[];
  allowed_options: IOption[];
  allowed_guests: IGuest[];
  maximum_rooms_allowed: number;
  maximum_guests_in_a_room: number;
  maximum_beds_in_a_room: number;
  maximum_length_of_stay: number;
  page_size: number;
  tax_percentage: number;
  vat_percentage: number;
  due_now_percentage: number;
  last_name_required: boolean;
}

export interface IFilter {
  name: string;
  values: IOption[];
  active: boolean;
}

export interface IRoomResponse {
  listRooms: IRoom[];
  totalRecords: number;
}

export interface IRoom {
  price: number;
  availableRooms: number;
  areaInSquareFeet: number;
  doubleBed: number;
  maxCapacity: number;
  singleBed: number;
  roomTypeName: string;
  roomTypeId: number;
}

export interface RoomProps {
  readonly room: IRoom;
}

export interface CarouselProps {
  images: string[];
  height: number
}

export interface FilterProps {
  absolute?: boolean;
}

export interface GuestsDropdownProps {
  readonly multiple?: boolean;
}

export interface ItineraryProps {
  checkout?: boolean;
}


export interface IPromotion {
  isDeactivated?: boolean;
  minimumDaysOfStay?: number;
  priceFactor: number;
  promotionDescription: string;
  promotionId: number;
  promotionTitle: string;
}
export interface IDataResponse {
  roomImages: string[];
  rating: number;
  totalReviews: number;
  bestPromotion: IPromotion;
  roomDescription: string;
  roomAmenities: string[];
}

export interface RoomModalProps {
  readonly room: IRoom;
  readonly data: IDataResponse;
}


export interface RoomsDropdownProps {
  readonly multiple?: boolean;
  readonly bed?: boolean;
}

export interface QueryParams {
  property: string;
  startDate: string;
  endDate: string;
  room?: string;
  bed?: string;
  seniors?: string;
  adults?: string;
  teens?: string;
  kids?: string;
}


export interface IItinerary {
  roomImageUrl: string;
  room: IRoom;
  selectedRooms: number;
  startDate: string;
  endDate: string;
  guestCounts: { [key: string]: number };
  selectedPromotion: IPromotion | null;
}