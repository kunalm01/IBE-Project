import { useLocation, useNavigate } from "react-router-dom";
import "./Timer.scss";
import { FormattedMessage } from "react-intl";
import { useTimer } from "react-timer-hook";
import { useDispatch } from "react-redux";
import { resetSelectedItinerary } from "../../redux/slices/CheckoutPageSlice";

export function Timer() {
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const pathName = location.pathname;
  const parts = pathName.split("/");
  const checkoutPart = parts[parts.length - 1];

  const expiryTimestamp = new Date();
  expiryTimestamp.setMinutes(expiryTimestamp.getMinutes() + 10);

  const { minutes, seconds } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      navigate("/");
      reduxDispatch(resetSelectedItinerary());
    },
  });

  return (
    checkoutPart.includes("checkout") && (
      <div className="timer">
        <span>
          <FormattedMessage id="time" defaultMessage="Time left:" />
        </span>
        <span>
          {minutes < 10 ? "0" + minutes : minutes}:
          {seconds < 10 ? "0" + seconds : seconds}
        </span>
      </div>
    )
  );
}
