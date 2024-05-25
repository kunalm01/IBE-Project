import { ReactNode } from "react";
import "./Dropdown.scss";
import { DropdownProps } from "../../utils/interface";
import { FormattedMessage } from "react-intl";

export function Dropdown<T extends ReactNode>({
  values,
  onChange = () => {},
  absolute = false,
  checkbox = false,
  filterValues = [],
  handleCheck = () => {},
  radio = false,
  current = Infinity,
  handleRadio = () => {},
  applyTranslation = false,
}: Readonly<DropdownProps<T>>) {
  const dropdownContainerStyle = absolute
    ? "dropdown-container dropdown-absolute"
    : "dropdown-container";

  const selectContainerStyle =
    checkbox || radio ? "select-container-checkbox" : "select-container";

  return (
    <div className={dropdownContainerStyle}>
      {values?.map((value: T) => (
        <button
          key={value?.toString()}
          className={selectContainerStyle}
          onClick={() =>
            checkbox
              ? handleCheck(value, filterValues.includes(value))
              : radio
              ? handleRadio(value, value === current)
              : onChange(value)
          }
        >
          <div className="select-title">
            {checkbox && (
              <input
                type="checkbox"
                name="checkbox"
                checked={filterValues.includes(value)}
                readOnly
              />
            )}
            {radio && (
              <input
                type="radio"
                name="radio"
                checked={value === current}
                readOnly
              />
            )}
            <span>
              {applyTranslation && typeof value === "string" ? (
                <FormattedMessage
                  id={value.toLowerCase()}
                  defaultMessage={value}
                />
              ) : (
                value
              )}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
