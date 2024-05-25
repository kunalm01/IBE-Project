import { Slider } from "@mui/material";
import "./SubscriptionPage.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { monitorPageView } from "../../utils/ga";
import { setBookings, setSubscription } from "../../redux/slices/AppSlice";

export function SubscriptionPage() {
  const appState = useSelector((state: RootState) => state.app);
  const configData = appState.configData;
  const subscription = appState.subscription;
  const idToken = appState.idToken;
  const loggedInEmail = appState.loggedInEmail;
  const loggedInUserName = appState.loggedInUserName;
  const bookings = appState.bookings;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reduxDispatch = useDispatch();
  const tenantHeaderLogoUrl = configData?.tenant_header_logo_url;

  const marks = [
    {
      value: 0,
      label: (
        <div className="label">
          0 <br /> <FormattedMessage id="starter" defaultMessage="Starter" />{" "}
          <br />
          <FormattedMessage id="membership" defaultMessage="Membership" />
        </div>
      ),
    },
    {
      value: 5,
      label: (
        <div className="label">
          5 <br /> KDU <br />
          <FormattedMessage id="membership" defaultMessage="Membership" />
        </div>
      ),
    },
    {
      value: 10,
      label: (
        <div className="label">
          10 <br /> FTE <br />
          <FormattedMessage id="membership" defaultMessage="Membership" />
        </div>
      ),
    },
  ];

  const subscriptions = [
    {
      name: <FormattedMessage id="STARTER" defaultMessage="STARTER" />,
      message: (
        <FormattedMessage
          id="starter message"
          defaultMessage="Enjoy basic hotel booking benefits."
        />
      ),
    },
    {
      name: "KDU",
      message: (
        <FormattedMessage
          id="kdu message"
          defaultMessage="Enjoy exclusive discounts and priority booking with 20% discount on all bookings."
        />
      ),
    },
    {
      name: "FTE",
      message: (
        <FormattedMessage
          id="fte message"
          defaultMessage="Enjoy premium access and loyalty rewards with 30% discount on all bookings. (Use code: FTE30)"
        />
      ),
    },
  ];

  const checkSubscription = async () => {
    if (loggedInEmail) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://team-11-ibe-apim.azure-api.net/api/v1/successful-bookings/${loggedInEmail}`,
          {
            headers: {
              token: idToken as string,
            },
          }
        );
        const data = await response.json();
        reduxDispatch(setBookings(data.bookings));

        if (data.bookings >= 10) {
          reduxDispatch(setSubscription(2));
        } else if (data.bookings >= 5) {
          reduxDispatch(setSubscription(1));
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    }
  };

  useEffect(() => {
    monitorPageView("/subscription", "Subscription Page");

    checkSubscription();
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [loggedInEmail]);

  return !idToken ? (
    <div className="login-wrapper">
      {!idToken && (
        <>
          <img src="/images/login.webp" alt="login-img" />
          <span>
            <FormattedMessage
              id="not logged-in message subscription"
              defaultMessage="Please login to view your subscription"
            />
            !
          </span>
        </>
      )}
    </div>
  ) : (
    subscription >= 0 && bookings >= 0 && (
      <div className="subscription-wrapper">
        <div className="subscription-container">
          <div className="subscription-info">
            <span className="guest-info">
              <FormattedMessage id="welcome" defaultMessage="Welcome" />{" "}
              <span className="guest-name">
                {loggedInUserName
                  ? loggedInUserName.split(" ")[0].toUpperCase()
                  : "User"}
                !
              </span>
            </span>
            <div className="subscription">
              <img src={tenantHeaderLogoUrl} alt="tenant-logo" />
              <span className="title">
                {subscriptions[subscription].name}{" "}
                <FormattedMessage id="member" defaultMessage="MEMBER" />
              </span>
              <span className="subscription-message">
                {subscriptions[subscription].message}
              </span>
            </div>
          </div>
          <div className="slider">
            {!isLoading && (
              <Slider
                defaultValue={bookings}
                step={null}
                marks={marks}
                min={0}
                max={10}
                disabled
                valueLabelDisplay="on"
                color="secondary"
              />
            )}
          </div>
          <div className="subscription-description">
            <span className="title">
              <FormattedMessage
                id="loyalty program"
                defaultMessage="Loyalty Program"
              />
            </span>
            <div className="subscriptions">
              <div className="subscription-item">
                <span className="name">
                  <FormattedMessage
                    id="starter membership title"
                    defaultMessage="Starter Membership"
                  />
                </span>
                <span>
                  <FormattedMessage
                    id="starter membership desc"
                    defaultMessage="Unlock basic hotel booking benefits"
                  />
                  .
                </span>
              </div>
              <div className="subscription-item">
                <span className="name">
                  <FormattedMessage
                    id="kdu membership title"
                    defaultMessage="KDU Membership"
                  />
                </span>
                <span>
                  <FormattedMessage
                    id="kdu membership desc"
                    defaultMessage="Unlock exclusive discounts and priority booking after 5
                  successful bookings"
                  />
                  .
                </span>
              </div>
              <div className="subscription-item">
                <span className="name">
                  <FormattedMessage
                    id="fte membership title"
                    defaultMessage="FTE Membership"
                  />
                </span>
                <span>
                  <FormattedMessage
                    id="fte membership desc"
                    defaultMessage="Get premium access and loyalty rewards after 10 successful
                  bookings"
                  />
                  .
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom"></div>
        </div>
      </div>
    )
  );
}
