export const msalConfig = {
    auth: {
      clientId: "3c778ad6-3a2d-41b1-bf68-c0ace397791b", // This is the ONLY mandatory field that you need to supply.
      authority:
        "https://ibe24.b2clogin.com/ibe24.onmicrosoft.com/B2C_1_team11_signup_signin", // Choose SUSI as your default authority.
      knownAuthorities: ["ibe24.b2clogin.com"], // Mark your B2C tenant's domain as trusted.
      redirectUri: "https://team-11-ibe-front-door-cvbsc5cjhnezeteg.z02.azurefd.net/", // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
      postLogoutRedirectUri: "https://team-11-ibe-front-door-cvbsc5cjhnezeteg.z02.azurefd.net/", // Indicates the page to navigate after logout.
      navigateToLoginRequestUrl: false, // If 'true', will navigate back to the original request location before processing the auth code response.
    },
    cache: {
      cacheLocation: "sessionStorage", // Configures cache location. 'sessionStorage' is more secure, but 'localStorage' gives you SSO between tabs.
      storeAuthStateInCookie: false, // Set this to 'true' if you are having issues on IE11 or Edge
    },
  };
  
  
  
  
  
  
  
  
  