import { Rating } from "@mui/material";
import "./ReviewPage.scss";
import { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";
import { useNavigate } from "react-router-dom";
import { monitorPageView } from "../../utils/ga";

interface IReviewResponse {
  tenantId: number;
  roomTypeId: number;
  roomTypeName: string;
}

export function ReviewPage() {
  const idToken = useSelector((state: RootState) => state.app.idToken);
  const loggedInUserName = useSelector(
    (state: RootState) => state.app.loggedInUserName
  );
  const [value, setValue] = useState<number | null>(5);
  const [hover, setHover] = useState(-1);
  const [reviewText, setReviewText] = useState("");
  const [data, setData] = useState<IReviewResponse>();

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const labels: { [index: string]: string } = {
    0.5: "Useless",
    1: "Useless+",
    1.5: "Poor",
    2: "Poor+",
    2.5: "Ok",
    3: "Ok+",
    3.5: "Good",
    4: "Good+",
    4.5: "Excellent",
    5: "Excellent+",
  };

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");

  function getLabelText(value: number) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
  }

  const handleReviewSubmit = async () => {
    if (data) {
      try {
        const response = await fetch(
          `https://team-11-ibe-apim.azure-api.net/api/v1/room-review/${data.tenantId}/${data.roomTypeId}?username=${loggedInUserName}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating: value,
              review: reviewText,
            }),
          }
        );
        if (response.ok) {
          reduxDispatch(
            showSnackbar({
              message: "Review submitted successfully. Thank you!",
              type: "success",
            })
          );
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    }
    setReviewText("");
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      if (bookingId) {
        try {
          const response = await fetch(
            `https://team-11-ibe-apim.azure-api.net/api/v1/review-booking/${bookingId}`
          );
          const data = await response.json();
          setData(data);
        } catch (error) {
          console.error("Error fetching booking data:", error);
        }
      }
    };

    fetchBookingData();
  }, [bookingId]);

  useEffect(() => {
    monitorPageView("/review", "Review Page");
  }, []);

  return !idToken ? (
    <div className="login-wrapper">
      <img src="/images/login.jpg" alt="login-img" />
      <span>Please login to add review!</span>
    </div>
  ) : (
    <div className="review-container">
      <div className="title">
        {`Please provide us a feedback about your stay at ${
          data?.roomTypeName ?? "our Hotel"
        }`}
      </div>
      {idToken && (
        <div className="review">
          <div className="rating-container">
            <Rating
              name="hover-feedback"
              size="large"
              value={value}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={(event, newValue) => {
                setValue(newValue);
                event.preventDefault();
              }}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
                event.preventDefault();
              }}
              emptyIcon={
                <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
              }
            />
            {value !== null && (
              <div>{labels[hover !== -1 ? hover : value]}</div>
            )}
          </div>
          <div className="review-text-container">
            <textarea
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              cols={50}
            ></textarea>
          </div>
          <button className="submit-review-btn" onClick={handleReviewSubmit}>
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
}
