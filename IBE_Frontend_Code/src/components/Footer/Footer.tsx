import { useSelector } from "react-redux";
import "./Footer.scss";
import { FormattedMessage } from "react-intl";
import { RootState } from "../../redux/store/store";

export function Footer() {
  const configData = useSelector((state: RootState) => state.app.configData);

  const tenantFooterLogoUrl = configData?.tenant_footer_logo_url;
  return (
    <footer id="footer">
      <div className="footer-container">
        <div className="logo-container">
          <img className="logo" src={tenantFooterLogoUrl} alt="tenant-logo" />
        </div>
        <div className="copyright-container">
          <div>&#169; {configData.tenant_full_name} </div>
          <div>
            <FormattedMessage
              id="footer"
              defaultMessage="All rights reserved"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
