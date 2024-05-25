import { useNavigate } from "react-router-dom";
import "./NotFoundPage.scss";
import { useEffect } from "react";
import { monitorPageView } from "../../utils/ga";

export function NotFoundPage() {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate("/");
  };

  useEffect(() => {
    monitorPageView("/*", "Not Found Page");
  }, []);

  return (
    <div className="not-found">
      <img src="/images/notfound.gif" alt="not-found" />
      <button onClick={navigateBack}>Home</button>
    </div>
  );
}
