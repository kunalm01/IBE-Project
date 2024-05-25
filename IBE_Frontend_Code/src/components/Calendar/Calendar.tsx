import { DateRangePicker, RangeKeyDict } from "react-date-range";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "usehooks-ts";
import { AppDispatch, RootState } from "../../redux/store/store";
import { FormattedMessage, FormattedNumber, IntlProvider } from "react-intl";
import "./Calendar.scss";
import { CalendarProps, IDateRange } from "../../utils/interface";
import { setEndDate, setStartDate } from "../../redux/slices/LandingPageSlice";
import { setDropdown } from "../../redux/slices/DropdownSlice";
import { setDateRange } from "../../redux/slices/AppSlice";
import { format } from "date-fns";

function Calendar({ right }: Readonly<CalendarProps>) {
  const appState = useSelector((state: RootState) => state.app);
  const landingPageState = useSelector((state: RootState) => state.landingPage);
  const currentConfig = appState.currentConfig;
  const currency = appState.currency;
  const rates = appState.rate;
  const minimumNightlyRates = landingPageState.minimumNightlyRates;
  const dateRange = appState.dateRange;

  const reduxDispatch: AppDispatch = useDispatch();

  const handleDateChange = (rangesByKey: RangeKeyDict) => {
    const { selection } = rangesByKey as { selection: IDateRange };
    if (selection) {
      reduxDispatch(setDateRange([{ ...selection, key: "selection" }]));
    }
  };

  const isDateRangeSame = () => {
    return (
      dateRange[0].startDate.toDateString() ===
      dateRange[0].endDate.toDateString()
    );
  };

  const getMinDate = (startDate: Date) => {
    const currentDate = new Date();
    const minDate = new Date(startDate);
    minDate.setDate(startDate.getDate() - (lengthOfStay - 1));
    if (minDate < currentDate) {
      return currentDate;
    }
    return minDate;
  };

  const getMaxEndDate = (startDate: Date) => {
    const limitDate = new Date("2024-06-30");
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + (lengthOfStay - 1));

    if (maxEndDate > limitDate) {
      return limitDate;
    }
    return maxEndDate;
  };

  const renderDayContent = (day: Date) => {
    const currentDay = new Date(day);
    currentDay.setDate(day.getDate() + 1);
    const currentDate = currentDay.toISOString().split("T")[0];
    const price = minimumNightlyRates?.[currentDate];
    return (
      <IntlProvider locale="en">
        <div className="date-price-container">
          <span className="date">{day.getDate()}</span>
          <span className="price">
            {price ? (
              <FormattedNumber
                style="currency"
                currency={currency}
                value={price * rates[currency]}
                maximumFractionDigits={0}
              />
            ) : (
              "-"
            )}
          </span>
          <span className="discounted-price"></span>
        </div>
      </IntlProvider>
    );
  };

  const calculateMinimumPrice = () => {
    const start = dateRange[0].startDate.getTime();
    const end = dateRange[0].endDate.getTime();

    let minimumPrice = Infinity;

    for (
      let currentDate = start + 86400000;
      currentDate <= end + 86400000;
      currentDate += 86400000
    ) {
      const formattedDate = new Date(currentDate).toISOString().split("T")[0];
      if (minimumNightlyRates[formattedDate] < minimumPrice) {
        minimumPrice = minimumNightlyRates[formattedDate];
      }
    }

    return minimumPrice;
  };

  const handleDateApply = () => {
    reduxDispatch(setDropdown("Calendar"));
    reduxDispatch(setStartDate(format(dateRange[0].startDate, "yyyy-MM-dd")));
    reduxDispatch(setEndDate(format(dateRange[0].endDate, "yyyy-MM-dd")));
  };

  const lengthOfStay = currentConfig
    ? currentConfig.maximum_length_of_stay
    : 14;
  const isMobileView = useMediaQuery(
    `(max-width: ${right ? "1200px" : "1023px"})`
  );

  return (
    <div className={`date-dropdown-container${right ? "-right" : ""}`}>
      <div className="calender">
        <DateRangePicker
          ranges={dateRange}
          className="dateRangePicker"
          onChange={handleDateChange}
          minDate={
            isDateRangeSame() ? getMinDate(dateRange[0].startDate) : new Date()
          }
          maxDate={
            isDateRangeSame()
              ? getMaxEndDate(dateRange[0].startDate)
              : new Date("2024-06-30")
          }
          months={isMobileView ? 1 : 2}
          direction="horizontal"
          editableDateInputs={true}
          dayContentRenderer={renderDayContent}
        />
      </div>
      <div
        className={`apply-btn-container ${
          isDateRangeSame() && "apply-btn-container-msg"
        }`}
      >
        <div className="price-btn-container">
          {!isDateRangeSame() && (
            <div className="starting-price-container">
              <FormattedMessage id="from" defaultMessage="from" />{" "}
              <IntlProvider locale="en">
                <FormattedNumber
                  style="currency"
                  currency={currency}
                  value={calculateMinimumPrice() * rates[currency]}
                  maximumFractionDigits={0}
                />
              </IntlProvider>
              /<FormattedMessage id="night" defaultMessage="night" />
            </div>
          )}
          <button
            className={`apply-btn ${isDateRangeSame() && "apply-btn-disabled"}`}
            disabled={isDateRangeSame()}
            onClick={handleDateApply}
          >
            <FormattedMessage
              id="calendarButton"
              defaultMessage="APPLY DATES"
            />
          </button>
        </div>
        {isDateRangeSame() && (
          <div className="end-date-select-message">
            <FormattedMessage
              id="endDateSelectMessage"
              defaultMessage="Please select end date. Max. length of stay: "
            />
            {lengthOfStay}&nbsp;
            <FormattedMessage id="days" defaultMessage="days" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
