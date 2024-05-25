import { useDispatch, useSelector } from "react-redux";
import "./Counter.scss";
import { RootState } from "../../redux/store/store";
import {
  setCounts,
  setSelectedRooms,
} from "../../redux/slices/LandingPageSlice";
import { CounterProps } from "../../utils/interface";
import { showSnackbar } from "../../redux/slices/SnackbarSlice";

export function Counter({ guestType }: Readonly<CounterProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const currentConfig = appState.currentConfig;
  const maximumAllowedGuestsInARoom = currentConfig?.maximum_guests_in_a_room;
  const maximumRoomsAllowed = currentConfig?.maximum_rooms_allowed;
  const counts = landingPageState.counts;
  const selectedRooms = landingPageState.selectedRooms;

  const reduxDispatch = useDispatch();

  const increaseCount = () => {
    const totalCounts = Object.values(counts).reduce(
      (total, count) => total + count,
      0
    );
    if (totalCounts < selectedRooms * maximumAllowedGuestsInARoom) {
      reduxDispatch(
        setCounts({ ...counts, [guestType]: counts[guestType] + 1 })
      );
    } else {
      if (selectedRooms < maximumRoomsAllowed) {
        if (guestType === "Adults") {
          reduxDispatch(setSelectedRooms(selectedRooms + 1));
          reduxDispatch(
            setCounts({ ...counts, [guestType]: counts[guestType] + 1 })
          );
        } else {
          if (counts["Adults"] > selectedRooms) {
            reduxDispatch(setSelectedRooms(selectedRooms + 1));
            reduxDispatch(
              setCounts({ ...counts, [guestType]: counts[guestType] + 1 })
            );
          } else {
            reduxDispatch(
              showSnackbar({
                message: "Increase adults count to add more guests!",
                type: "error",
              })
            );
          }
        }
      } else {
        reduxDispatch(
          showSnackbar({
            message: "Maximum guests per booking threshold reached!",
            type: "error",
          })
        );
      }
    }
  };

  const decreaseCount = () => {
    const totalCounts = Object.values(counts).reduce(
      (total, count) => total + count,
      0
    );
    if (counts[guestType] > 0) {
      if (guestType === "Adults") {
        if (counts[guestType] > selectedRooms) {
          reduxDispatch(
            setCounts({ ...counts, [guestType]: counts[guestType] - 1 })
          );
        } else {
          reduxDispatch(
            showSnackbar({
              message: "Adults count cannot be less than room count!",
              type: "error",
            })
          );
        }
      } else {
        if (
          Math.ceil((totalCounts - 1) / maximumAllowedGuestsInARoom) <
          selectedRooms
        ) {
          reduxDispatch(
            setSelectedRooms(
              Math.ceil((totalCounts - 1) / maximumAllowedGuestsInARoom)
            )
          );
        }
        reduxDispatch(
          setCounts({ ...counts, [guestType]: counts[guestType] - 1 })
        );
      }
    } else {
      reduxDispatch(
        showSnackbar({
          message: "Guests count cannot be negative!",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="counter-container">
      <button onClick={decreaseCount}>
        <img src="/icons/minus.png" alt="minus" className="icon" />
      </button>
      <span className="count">{counts[guestType]}</span>
      <button onClick={increaseCount}>
        <img src="/icons/plus.png" alt="plus" className="icon" />
      </button>
    </div>
  );
}
