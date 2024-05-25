import "./Header.scss";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  setBookings,
  setCurrency,
  setIdToken,
  setLocale,
  setLoggedInEmail,
  setLoggedInUserName,
  setSubscription,
} from "../../redux/slices/AppSlice";
import { useMediaQuery } from "usehooks-ts";
import { Dropdown } from "../Dropdown/Dropdown";
import { RootState } from "../../redux/store/store";
import { Link, useNavigate } from "react-router-dom";
import { IDropdownItem } from "../../utils/interface";
import { closeDropdown, setDropdown } from "../../redux/slices/DropdownSlice";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { monitorEvent } from "../../utils/ga";

interface CustomJwtPayload extends JwtPayload {
  emails: string[];
  given_name: string;
  family_name: string;
}

export function Header() {
  const appState = useSelector((state: RootState) => state.app);
  const dropdownState = useSelector((state: RootState) => state.dropdown);
  const isLanguageActive = dropdownState.isLanguageActive;
  const isCurrencyActive = dropdownState.isCurrencyActive;
  const isMenuOpen = dropdownState.isMenuActive;
  const locale = appState.locale;
  const configData = appState.configData;
  const selectedCurrency = appState.currency;
  const translation = appState.translation;
  const [languageList, setLanguageList] = useState<IDropdownItem[]>([]);
  const [currencyList, setCurrencyList] = useState<IDropdownItem[]>([]);
  const [userUpdated, setUserUpdated] = useState<boolean>(false);
  const idToken = appState.idToken;
  const loggedInEmail = appState.loggedInEmail;

  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const currencyRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutsideDropdown = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      reduxDispatch(closeDropdown("Menu"));
    }
    if (
      languageRef.current &&
      !languageRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Language"));
    }
    if (
      currencyRef.current &&
      !currencyRef.current.contains(event.target as Node)
    ) {
      reduxDispatch(closeDropdown("Currency"));
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("click", handleClickOutsideDropdown);
    };
  }, []);

  const toggleMenu = () => {
    reduxDispatch(setDropdown("Menu"));
  };

  const handleLanguageChange = (value: string) => {
    const newLocale = languageList.filter(
      (language) => language.name === value
    )[0].symbol;
    reduxDispatch(setLocale(newLocale.toLowerCase()));
    reduxDispatch(setCurrency(configData.language_wise_currency[newLocale]));
    reduxDispatch(setDropdown("Language"));
  };

  const handleLanguageChangeMenu = (value: string) => {
    const newLocale = languageList.filter(
      (language) => language.name === value
    )[0].symbol;
    reduxDispatch(setLocale(newLocale.toLowerCase()));
    reduxDispatch(setCurrency(configData.language_wise_currency[newLocale]));
    reduxDispatch(setDropdown("Language"));
    reduxDispatch(setDropdown("Menu"));
  };

  const handleCurrencyChange = (value: string) => {
    reduxDispatch(setCurrency(value));
    reduxDispatch(setDropdown("Currency"));
  };

  const handleCurrencyChangeMenu = (value: string) => {
    reduxDispatch(setCurrency(value));
    reduxDispatch(setDropdown("Currency"));
    reduxDispatch(setDropdown("Menu"));
  };

  const handleLanguageDropdown = () => {
    reduxDispatch(setDropdown("Language"));
  };

  const handleLanguageDropdownMenu = () => {
    reduxDispatch(setDropdown("LanguageMenu"));
  };

  const handleCurrencyDropdownMenu = () => {
    reduxDispatch(setDropdown("CurrencyMenu"));
  };

  const handleCurrencyDropdown = () => {
    reduxDispatch(setDropdown("Currency"));
  };

  const handleMyBookings = () => {
    navigate("/my-bookings");
  };

  const handleSubscription = () => {
    navigate("/subscription");
  };

  const updateUser = async (emailId: string, token: string) => {
    const response = await fetch(`https://team-11-ibe-apim.azure-api.net/api/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailId,
        token,
      }),
    });
    if(response.ok){
      setUserUpdated(true);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (loggedInEmail && userUpdated) {
        try {
          const response = await fetch(
            `https://team-11-ibe-apim.azure-api.net/api/v1/successful-bookings/${loggedInEmail}`,
            {
              headers: {  
                token: idToken as string,
              },
            }
          );
          const data = await response.json();

          if (data.bookings >= 10) {
            reduxDispatch(setSubscription(2));
          } else if (data.bookings >= 5) {
            reduxDispatch(setSubscription(1));
          }
          reduxDispatch(setBookings(data.bookings));
        } catch (error) {
          console.error("Error fetching booking data:", error);
        }
        setUserUpdated(false);
      }
    };

    checkSubscription();
  }, [loggedInEmail]);

  useEffect(() => {
    const storedValue = sessionStorage.getItem(
      "msal.token.keys.3c778ad6-3a2d-41b1-bf68-c0ace397791b"
    );
    if (storedValue) {
      const idTokenKey = JSON.parse(storedValue);
      const token = JSON.parse(
        sessionStorage.getItem(idTokenKey.idToken[0]) as string
      ).secret;
      reduxDispatch(setIdToken(token));
    }
  }, []);

  useEffect(() => {
    if (idToken) {
      const decoded: CustomJwtPayload = jwtDecode(idToken);
      reduxDispatch(setLoggedInEmail(decoded.emails[0]));
      reduxDispatch(
        setLoggedInUserName(decoded.given_name + " " + decoded.family_name)
      );
      updateUser(decoded.emails[0], idToken);
    }
  }, [idToken]);

  useEffect(() => {
    if (configData) {
      setLanguageList(configData.supported_languages);
      setCurrencyList(configData.supported_currencies);
    }
  }, [configData]);

  const { instance } = useMsal();
  const Login = async () => {
    try {
      const { idToken } = await instance.loginPopup();
      reduxDispatch(setIdToken(idToken));
      monitorEvent("User Login", "User Logged In", "Login");
    } catch (error) {
      console.error(error);
    }
  };
  const Logout = async () => {
    try {
      await instance.logoutPopup();
      reduxDispatch(setIdToken(null));
      reduxDispatch(setLoggedInEmail(null));
      reduxDispatch(setLoggedInUserName(null));
      reduxDispatch(setSubscription(0));
      monitorEvent("User Logout", "User Logged Out", "Logout");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const isMobileView = useMediaQuery("(max-width: 600px)");
  const tenantHeaderLogoUrl = configData?.tenant_header_logo_url;
  const tenantMiniLogoUrl = configData?.tenant_mini_logo_url;

  return (
    <header id="header">
      <div className="header-container">
        <div className="app-info">
          <div className="logo-container">
            <Link to="/" className="linktag">
              <img
                src={tenantHeaderLogoUrl}
                alt="tenant-logo"
                className="logo"
              />
              <img
                className="small-logo"
                src={tenantMiniLogoUrl}
                alt="tenant-logo"
              />
            </Link>
          </div>
          <div className="app-name-container">
            <div className="app-name">
              <Link className="linktag" to="/">
                {translation && Object.keys(translation).length !== 0 && (
                  <FormattedMessage
                    id="appName"
                    defaultMessage={configData.application_title}
                  />
                )}
              </Link>
            </div>
          </div>
        </div>
        <div className="menu-container">
          <div className="crown" onClick={handleSubscription}>
            <img src="/icons/crown.png" alt="crown" />
            <span className="crown-info">My Subscription</span>
          </div>
          <div className="bookings-btn-container">
            <button className="bookings-btn" onClick={handleMyBookings}>
              <FormattedMessage id="bookings" defaultMessage="MY BOOKINGS" />
            </button>
          </div>
          <div className="header-dropdown-container">
            <div className="language-container" ref={languageRef}>
              <div className="language" onClick={handleLanguageDropdown}>
                <img src="/icons/globe.png" alt="globe" />
                <div>{locale.charAt(0).toUpperCase() + locale.slice(1)}</div>
              </div>
              {isLanguageActive && (
                <Dropdown<string>
                  values={languageList.map((language) => language.name)}
                  onChange={handleLanguageChange}
                  absolute
                />
              )}
            </div>
            <div className="currency-container" ref={currencyRef}>
              <div className="currency" onClick={handleCurrencyDropdown}>
                {currencyList &&
                  currencyList.length > 0 &&
                  currencyList.find(
                    (currency) => currency.name === selectedCurrency
                  )?.symbol}
              </div>
              {isCurrencyActive && (
                <Dropdown<string>
                  values={currencyList.map((currency) =>
                    currency.symbol.substring(2)
                  )}
                  onChange={handleCurrencyChange}
                  absolute
                />
              )}
            </div>
          </div>
          <div className="login-btn-container">
            <UnauthenticatedTemplate>
              <button className="login-btn" onClick={Login}>
                <FormattedMessage id="login" defaultMessage="LOGIN" />
              </button>
            </UnauthenticatedTemplate>
            <AuthenticatedTemplate>
              <button className="login-btn" onClick={Logout}>
                <FormattedMessage id="logout" defaultMessage="LOGOUT" />
              </button>
            </AuthenticatedTemplate>
          </div>
          <div ref={menuRef} className="hamburger-container">
            <button className="hamburger" onClick={toggleMenu}>
              {isMenuOpen ? "X" : "☰"}
            </button>
            {isMenuOpen && isMobileView && (
              <div className="menu-overlay">
                <div className="ham-bookings-btn-container">
                  <button
                    className="ham-bookings-btn"
                    onClick={handleMyBookings}
                  >
                    <FormattedMessage
                      id="bookings"
                      defaultMessage="MY BOOKINGS"
                    />
                  </button>
                </div>

                <div className="ham-dropdown-container">
                  <div className="ham-language-container" ref={languageRef}>
                    <div
                      className={`language ${
                        isLanguageActive ? "language-active" : ""
                      }`}
                      onClick={handleLanguageDropdownMenu}
                    >
                      <div className="language-info">
                        <img src="/icons/globe.png" alt="globe" />
                        <div>
                          {locale.charAt(0).toUpperCase() + locale.slice(1)}
                        </div>
                      </div>
                      <img
                        src={
                          isLanguageActive
                            ? "/icons/arrow-up.png"
                            : "/icons/arrow-down.png"
                        }
                        alt=""
                      />
                    </div>
                    {isLanguageActive && (
                      <Dropdown<string>
                        values={languageList.map((language) => language.name)}
                        onChange={handleLanguageChangeMenu}
                      />
                    )}
                  </div>
                  <div className="ham-currency-container" ref={currencyRef}>
                    <div
                      className={`currency ${
                        isCurrencyActive ? "currency-active" : ""
                      }`}
                      onClick={handleCurrencyDropdownMenu}
                    >
                      <div>
                        {
                          currencyList.find(
                            (currency) => currency.name === selectedCurrency
                          )?.symbol
                        }
                      </div>
                      <img
                        src={
                          isCurrencyActive
                            ? "/icons/arrow-up.png"
                            : "/icons/arrow-down.png"
                        }
                        alt=""
                      />
                    </div>
                    {isCurrencyActive && (
                      <Dropdown<string>
                        values={currencyList.map((currency) =>
                          currency.symbol.substring(2)
                        )}
                        onChange={handleCurrencyChangeMenu}
                      />
                    )}
                  </div>
                </div>
                <div className="ham-login-btn-container">
                  <UnauthenticatedTemplate>
                    <button className="ham-login-btn" onClick={Login}>
                      <FormattedMessage id="login" defaultMessage="LOGIN" />
                    </button>
                  </UnauthenticatedTemplate>
                  <AuthenticatedTemplate>
                    <button className="ham-login-btn" onClick={Logout}>
                      <FormattedMessage id="logout" defaultMessage="LOGOUT" />
                    </button>
                  </AuthenticatedTemplate>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
