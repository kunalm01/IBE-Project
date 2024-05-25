import { useDispatch, useSelector } from "react-redux";
import {
  setBillingFields,
  setCurrentActiveForm,
} from "../../redux/slices/CheckoutPageSlice";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import * as csc from "country-state-city";
import { Dropdown } from "../Dropdown/Dropdown";
import { RootState } from "../../redux/store/store";
import { FormattedMessage } from "react-intl";
import { validate } from "email-validator";

const zipApiKey = import.meta.env.VITE_ZIP_API_KEY;

const validateZipCode = async (zipCode: string, selectedCityState: string) => {
  try {
    const response = await fetch(
      `https://global-zip-codes-with-lat-and-lng.p.rapidapi.com/api/v1/geocode/validate?code=${zipCode}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": zipApiKey,
          "X-RapidAPI-Host": "global-zip-codes-with-lat-and-lng.p.rapidapi.com",
        },
      }
    );

    const { details } = await response.json();

    if (details && details.length > 0) {
      const area = details[0].area;
      const district = details[0].district;
      const name = details[0].place_name;
      const state = details[0].state;

      if (
        area.includes(selectedCityState) ||
        district.includes(selectedCityState) ||
        name.includes(selectedCityState) ||
        state.includes(selectedCityState)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error validating zipcode:", error);
    return false;
  }
};

const reg = /^$|^[a-zA-Z]+$/;

const billingSchema = yup
  .object({
    firstName: yup
      .string()
      .required("Field cannot be empty")
      .matches(reg, "Invalid input"),
    lastName: yup.string().matches(reg, "Invalid input"),
    address1: yup.string().required("Field cannot be empty"),
    address2: yup.string(),
    zipcode: yup.string().required("Field cannot be empty"),
    phone: yup
      .string()
      .length(10, "Phone should be of 10 digits")
      .required("Field cannot be empty"),
    email: yup
      .string()
      .test("valid-email", "Invalid email", (value) => {
        if (value && !validate(value)) {
          return false;
        }
        return true;
      })
      .email("Invalid email")
      .required("Field cannot be empty"),
  })
  .required();

type billingFormFields = yup.InferType<typeof billingSchema>;

export function BillingForm() {
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const appState = useSelector((state: RootState) => state.app);
  const lastNameRequired = appState.currentConfig.last_name_required;
  const billingFields = checkoutPageState.billingFields;
  const [activeMenu, setActiveMenu] = useState<number>(0);
  const [zipCodeValid, setZipCodeValid] = useState(true);
  const [countryError, setCountryError] = useState<boolean>(false);
  const [stateError, setStateError] = useState<boolean>(false);
  const [cityError, setCityError] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string;
    code: string;
  }>({ name: "", code: "" });
  const [selectedState, setSelectedState] = useState<{
    name: string;
    code: string;
  }>({ name: "", code: "" });
  const [selectedCity, setSelectedCity] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<billingFormFields>({
    resolver: yupResolver(billingSchema),
  });

  const reduxDispatch = useDispatch();
  const countries = csc.Country.getAllCountries();

  const updatedCountries: string[] = countries
    .map((country) => country.name)
    .filter((country) => country === "India" || country === "United States");

  const updatedStates = (countryId: string): string[] =>
    csc.State.getStatesOfCountry(countryId).map((state) => state.name);

  const updatedCities = (countryId: string, stateId: string): string[] =>
    csc.City.getCitiesOfState(countryId, stateId).map((city) => city.name);

  const handleCountryChange = (country: string) => {
    const newCountry = countries.find((countri) => countri.name === country);
    if (newCountry) {
      setSelectedCountry({ name: newCountry?.name, code: newCountry?.isoCode });
      setSelectedState({ name: "", code: "" });
      setSelectedCity("");
    }
    setActiveMenu(0);
    setCountryError(false);
  };

  const handleStateChange = (state: string) => {
    const newState = csc.State.getStatesOfCountry(selectedCountry.code).find(
      (stat) => stat.name === state
    );
    if (newState) {
      setSelectedCity("");
      setSelectedState({ name: newState?.name, code: newState?.isoCode });
    }
    setActiveMenu(0);
    setStateError(false);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setActiveMenu(0);
    setCityError(false);
  };

  const handleDropdown = (menuNo: number) => {
    if (activeMenu === menuNo) {
      setActiveMenu(0);
    } else {
      setActiveMenu(menuNo);
    }
  };

  const handleCustomSubmit = () => {
    const citySelected = selectedCity.length;
    const countrySelected = selectedCountry.name.length;
    const stateSelected = selectedState.name.length;

    if (!citySelected || !countrySelected || !stateSelected) {
      if (!citySelected) {
        setCityError(true);
      }
      if (!countrySelected) {
        setCountryError(true);
      }
      if (!stateSelected) {
        setStateError(true);
      }
    }
  };

  const handleBillingPrevButtonClick = () => {
    reduxDispatch(setCurrentActiveForm(0));
  };

  const handleBillingNextButtonClick = () => {
    reduxDispatch(setCurrentActiveForm(2));
  };

  const onSubmit: SubmitHandler<billingFormFields> = async (data) => {
    const isValidZipCode = await validateZipCode(data.zipcode, selectedCity);
    setZipCodeValid(isValidZipCode);

    if (!isValidZipCode) {
      return;
    }
    const citySelected = selectedCity.length;
    const countrySelected = selectedCountry.name.length;
    const stateSelected = selectedState.name.length;

    if (!citySelected || !countrySelected || !stateSelected) {
      if (!citySelected) {
        setCityError(true);
      }
      if (!countrySelected) {
        setCountryError(true);
      }
      if (!stateSelected) {
        setStateError(true);
      }
      return;
    }
    handleBillingNextButtonClick();
    reduxDispatch(
      setBillingFields({
        ...data,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
      })
    );
  };

  useEffect(() => {
    if (billingFields.country.name.length > 0) {
      setSelectedCountry(billingFields.country);
    }
    if (billingFields.state.name.length > 0) {
      setSelectedState(billingFields.state);
    }
    if (billingFields.city.length > 0) {
      setSelectedCity(billingFields.city);
    }
  }, [billingFields]);

  return (
    <form
      id="billing-form"
      className="info-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="name-input">
        <div className="first-name-container">
          <span className="title">
            <FormattedMessage id="firstNameTitle" defaultMessage="First Name" />
            *
          </span>
          <input
            {...register("firstName")}
            type="text"
            name="firstName"
            id="billing-first-name"
            className="input"
            defaultValue={billingFields.firstName}
          />
          {errors.firstName && (
            <div style={{ color: "red" }}>
              <FormattedMessage
                id={errors.firstName.message}
                defaultMessage={errors.firstName.message}
              />
            </div>
          )}
        </div>
        {lastNameRequired && (
          <div className="first-name-container">
            <span className="title">
              <FormattedMessage id="lastNameTitle" defaultMessage="Last Name" />
            </span>
            <input
              {...register("lastName")}
              type="text"
              name="lastName"
              id="billing-last-name"
              className="input"
              defaultValue={billingFields.lastName}
            />
            {errors.lastName && (
              <div style={{ color: "red" }}>
                <FormattedMessage
                  id={errors.lastName.message}
                  defaultMessage={errors.lastName.message}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="name-input">
        <div className="first-name-container">
          <span className="title">
            <FormattedMessage
              id="address1Title"
              defaultMessage="Mailing Address1"
            />
            *
          </span>
          <input
            {...register("address1")}
            type="text"
            name="address1"
            id="address1"
            className="input"
            defaultValue={billingFields.address1}
          />
          {errors.address1 && (
            <div style={{ color: "red" }}>
              <FormattedMessage
                id={errors.address1.message}
                defaultMessage={errors.address1.message}
              />
            </div>
          )}
        </div>
        <div className="first-name-container">
          <span className="title">
            <FormattedMessage
              id="address2Title"
              defaultMessage="Mailing Address2"
            />
          </span>
          <input
            {...register("address2")}
            type="text"
            name="address2"
            id="address2"
            className="input"
            defaultValue={billingFields.address2}
          />
          {errors.address2 && (
            <div style={{ color: "red" }}>
              <FormattedMessage
                id={errors.address2.message}
                defaultMessage={errors.address2.message}
              />
            </div>
          )}
        </div>
      </div>
      <div className="input-wrapper">
        <span className="title">
          <FormattedMessage id="countryTitle" defaultMessage="Country" />*
        </span>
        <div className="input-dropdown" onClick={() => handleDropdown(1)}>
          <span
            className={`selected-title ${selectedCountry.name.length > 0 &&
              "selected-title-active"}`}
          >
            {selectedCountry.name.length > 0 ? selectedCountry.name : "Select"}
          </span>
          <img src="/icons/arrow-down.png" alt="arrow-down" />
        </div>
        {activeMenu !== 1 && countryError && (
          <div style={{ color: "red", marginTop: "7px" }}>
            <FormattedMessage
              id="Please select country"
              defaultMessage="Please select country"
            />
          </div>
        )}
        {activeMenu === 1 && (
          <div className="dropdown-input">
            <Dropdown<string>
              values={updatedCountries}
              onChange={handleCountryChange}
              absolute
            />
          </div>
        )}
      </div>
      <div className="triple-input">
        <div className="one-input-container">
          <div className="input-wrapper">
            <span className="title">
              <FormattedMessage id="stateTitle" defaultMessage="State" />*
            </span>
            <div className="input-dropdown" onClick={() => handleDropdown(2)}>
              <span
                className={`selected-title ${selectedState.name.length > 0 &&
                  "selected-title-active"}`}
              >
                {selectedState.name.length > 0 ? selectedState.name : "Select"}
              </span>
              <img src="/icons/arrow-down.png" alt="arrow-down" />
            </div>
            {activeMenu !== 2 && stateError && (
              <div style={{ color: "red", marginTop: "7px" }}>
                <FormattedMessage
                  id="Please select state"
                  defaultMessage="Please select state"
                />
              </div>
            )}
            {activeMenu === 2 && selectedCountry.name.length > 0 && (
              <div className="dropdown-input">
                <Dropdown<string>
                  values={updatedStates(selectedCountry.code)}
                  onChange={handleStateChange}
                  absolute
                />
              </div>
            )}
          </div>
        </div>
        <div className="two-input-container">
          <div className="inside-container">
            <div className="input-wrapper">
              <span className="title">
                <FormattedMessage id="cityTitle" defaultMessage="City" />*
              </span>
              <div className="input-dropdown" onClick={() => handleDropdown(3)}>
                <span
                  className={`selected-title ${selectedCity.length > 0 &&
                    "selected-title-active"}`}
                >
                  {selectedCity.length > 0 ? selectedCity : "Select"}
                </span>
                <img src="/icons/arrow-down.png" alt="arrow-down" />
              </div>
              {activeMenu !== 3 && cityError && (
                <div style={{ color: "red", marginTop: "7px" }}>
                  <FormattedMessage
                    id="Please select city"
                    defaultMessage="Please select city"
                  />
                </div>
              )}
              {activeMenu === 3 && selectedState.name.length > 0 && (
                <div className="dropdown-input">
                  <Dropdown<string>
                    values={updatedCities(
                      selectedCountry.code,
                      selectedState.code
                    )}
                    onChange={handleCityChange}
                    absolute
                  />
                </div>
              )}
            </div>
          </div>
          <div className="inside-container">
            <span className="title">
              <FormattedMessage id="zipTitle" defaultMessage="Zip" />*
            </span>
            <input
              {...register("zipcode")}
              type="number"
              maxLength={6}
              name="zipcode"
              id="zip"
              className="input"
              defaultValue={billingFields.zipcode}
            />
            {errors.zipcode && (
              <div style={{ color: "red" }}>
                <FormattedMessage
                  id={errors.zipcode.message}
                  defaultMessage={errors.zipcode.message}
                />
              </div>
            )}
            {!zipCodeValid && (
              <div style={{ color: "red" }}>
                <FormattedMessage
                  id="invalidZipMessage"
                  defaultMessage="Invalid zip code for the selected city"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="input-container">
        <span className="title">
          <FormattedMessage id="phoneTitle" defaultMessage="Phone" />*
        </span>
        <input
          {...register("phone")}
          type="number"
          name="phone"
          id="billing-phone"
          className="input"
          defaultValue={billingFields.phone}
        />
        {errors.phone && (
          <div style={{ color: "red" }}>
            <FormattedMessage
              id={errors.phone.message}
              defaultMessage={errors.phone.message}
            />
          </div>
        )}
      </div>
      <div className="input-container">
        <span className="title">
          <FormattedMessage id="emailTitle" defaultMessage="Email" />*
        </span>
        <input
          {...register("email")}
          type="email"
          name="email"
          id="billing-email"
          className="input"
          defaultValue={billingFields.email}
        />
        {errors.email && (
          <div style={{ color: "red" }}>
            <FormattedMessage
              id={errors.email.message}
              defaultMessage={errors.email.message}
            />
          </div>
        )}
      </div>
      <div className="billing-button">
        <button className="prev-btn" onClick={handleBillingPrevButtonClick}>
          <FormattedMessage
            id="editTravelerInfoBtn"
            defaultMessage="Edit Traveler Info."
          />
        </button>
        <button type="submit" className="next-btn" onClick={handleCustomSubmit}>
          <FormattedMessage
            id="paymentNextBtn"
            defaultMessage="NEXT: PAYMENT INFO"
          />
        </button>
      </div>
    </form>
  );
}
