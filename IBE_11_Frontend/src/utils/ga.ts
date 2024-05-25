import ReactGA from "react-ga4";

export const monitorPageView = (page: string, title: string) => {
  ReactGA.send({
    hitType: "pageview",
    page: page,
    title: title,
  });
};

export const monitorEvent = (
  category: string,
  action: string,
  label: string
) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
