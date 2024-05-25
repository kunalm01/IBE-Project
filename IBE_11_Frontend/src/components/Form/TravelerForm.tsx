import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentActiveForm,
  setTravelerFields,
} from "../../redux/slices/CheckoutPageSlice";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { RootState } from "../../redux/store/store";
import { FormattedMessage } from "react-intl";
import { validate } from "email-validator";

const reg = /^$|^[a-zA-Z]+$/;

const travelerSchema = yup
  .object({
    firstName: yup.string().required("Field cannot be empty").matches(reg, "Invalid input"),
    lastName: yup.string().matches(reg, "Invalid input"),
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

type travelerFormFields = yup.InferType<typeof travelerSchema>;

export function TravelerForm() {
  const appState = useSelector((state: RootState) => state.app);
  const checkoutPageState = useSelector(
    (state: RootState) => state.checkoutPage
  );
  const lastNameRequired = appState.currentConfig.last_name_required;
  const travelerFields = checkoutPageState.travelerFields;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<travelerFormFields>({
    resolver: yupResolver(travelerSchema),
  });

  const reduxDispatch = useDispatch();


  const handleTravelerNextButtonClick = () => {
    reduxDispatch(setCurrentActiveForm(1));
  };

  const onSubmit: SubmitHandler<travelerFormFields> = (data) => {
    handleTravelerNextButtonClick();
    reduxDispatch(setTravelerFields(data));
  };

  return (
    <form
      id="traveler-form"
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
            id="traveler-first-name"
            className="input"
            defaultValue={travelerFields.firstName}
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
              id="traveler-last-name"
              className="input"
              defaultValue={travelerFields.lastName}
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
      <div className="input-container">
        <span className="title">
          <FormattedMessage id="phoneTitle" defaultMessage="Phone" />*
        </span>
        <input
          {...register("phone")}
          type="number"
          name="phone"
          id="traveler-phone"
          className="input"
          defaultValue={travelerFields.phone}
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
          id="traveler-email"
          className="input"
          defaultValue={travelerFields.email}
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
        <button type="submit" className="next-btn">
          <FormattedMessage
            id="billingNextBtn"
            defaultMessage="NEXT: BILLING INFO"
          />
        </button>
      </div>
    </form>
  );
}
