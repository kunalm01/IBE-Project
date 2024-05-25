import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { setStepperState } from "../../redux/slices/RoomResultsSlice";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";

export function MUIStepper() {
  const roomResultsState = useSelector((state: RootState) => state.roomResults);
  const stepperState = roomResultsState.stepperState;

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const handleState = (nextState: number) => {
    if (nextState < stepperState) {
      reduxDispatch(setStepperState(nextState));
      if (nextState === 0) {
        navigate("/rooms");
      }
      if (nextState === 1) {
        navigate("/rooms");
      }
    }
  };

  const steps = ["1: Choose room", "2: Choose add on", "3: Checkout"];

  return (
    <Box sx={{ width: "417px" }}>
      <Stepper activeStep={stepperState} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              onClick={() => handleState(index)}
              sx={{ marginTop: "5px" }}
            >
              <FormattedMessage
                id={`step${index + 1}`}
                defaultMessage={label}
              />
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
