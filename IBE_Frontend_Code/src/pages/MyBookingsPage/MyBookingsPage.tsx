import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { useEffect, useState } from "react";
import "./MyBookingsPage.scss";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import ClipLoader from "react-spinners/ClipLoader";
import { monitorPageView } from "../../utils/ga";

interface IMyBookingsResponse {
  active: boolean;
  bookingId: number;
  roomCount: number;
  roomName: string;
  startDate: string;
  endDate: string;
}

export function MyBookingsPage() {
  const appState = useSelector((state: RootState) => state.app);
  const idToken = appState.idToken;
  const loggedInEmail = appState.loggedInEmail;
  const [myBookingsData, setMyBookingsData] = useState<IMyBookingsResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleClick = (bookingId: number) => {
    navigate(`/booking?bookingId=${bookingId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (loggedInEmail) {
        setIsLoading(true);
        const response = await fetch(
          `https://team-11-ibe-apim.azure-api.net/api/v1/my-bookings?email=${loggedInEmail}`,
          {
            headers: {
              token: idToken as string,
            },
          }
        );
        const data = await response.json();
        const sortedData = data.myBookings.sort(
          (a: IMyBookingsResponse, b: IMyBookingsResponse) =>
            b.bookingId - a.bookingId
        );
        setMyBookingsData(sortedData);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [loggedInEmail]);

  useEffect(() => {
    monitorPageView("/my-bookings", "My Bookings Page");
  }, []);

  const currentDate = new Date();

  return loggedInEmail ? (
    isLoading ? (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "90vh",
          alignItems: "center",
        }}
      >
        <ClipLoader
          color="black"
          loading={isLoading}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
          className="loader"
        />
      </div>
    ) : (
      <div className="my-bookings-container">
        <span className="title">
          <FormattedMessage id="mybookings" defaultMessage="My Bookings" />
        </span>
        {myBookingsData.length > 0 ? (
          <div className="my-bookings">
            {myBookingsData.map((myBooking) => {
              const startDate = new Date(myBooking.startDate);
              const endDate = new Date(myBooking.endDate);
              const isUpcoming = myBooking.active && startDate > currentDate;
              const isOngoing =
                myBooking.active &&
                currentDate >= startDate &&
                currentDate <= endDate;
              const isSuccessful =
                myBooking.active &&
                endDate < currentDate &&
                currentDate > startDate;

              return (
                <div key={myBooking.bookingId} className="my-booking">
                  <div className="booking-info">
                    <span>
                      <FormattedMessage id="booking" defaultMessage="Booking" />{" "}
                      ID: #{myBooking.bookingId}
                    </span>
                    <span>
                      <FormattedMessage id="booking" defaultMessage="Booking" />{" "}
                      <FormattedMessage id="status" defaultMessage="Status" />:{" "}
                      {isUpcoming ? (
                        <span className="upcoming">
                          <FormattedMessage
                            id="upcomingbook"
                            defaultMessage="Upcoming"
                          />
                        </span>
                      ) : isOngoing ? (
                        <span className="ongoing">
                          <FormattedMessage
                            id="ongoingbook"
                            defaultMessage="Ongoing"
                          />
                        </span>
                      ) : isSuccessful ? (
                        <span className="successful">
                          <FormattedMessage
                            id="successfulbook"
                            defaultMessage="Successful"
                          />
                        </span>
                      ) : (
                        <span className="cancelled">
                          <FormattedMessage
                            id="cancelBooking"
                            defaultMessage="Cancelled"
                          />
                        </span>
                      )}
                    </span>
                    <span className="date">
                      {myBooking.startDate} - {myBooking.endDate}
                    </span>
                    <span>
                      {myBooking.roomCount} x{" "}
                      <FormattedMessage
                        id={myBooking.roomName.toLowerCase()}
                        defaultMessage={myBooking.roomName}
                      />
                    </span>
                  </div>
                  <button
                    className="view-booking-btn"
                    onClick={() => handleClick(myBooking.bookingId)}
                  >
                    <FormattedMessage id="view" defaultMessage="View Booking" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <FormattedMessage id="noBook" defaultMessage="No Bookings found!" />
          </div>
        )}
      </div>
    )
  ) : (
    <div className="login-wrapper">
      <img src="/images/login.webp" alt="login-img" />
      <span>
        <FormattedMessage
          id="not logged-in message bookings"
          defaultMessage="Please login to view your bookings"
        />
        !
      </span>
    </div>
  );
}
