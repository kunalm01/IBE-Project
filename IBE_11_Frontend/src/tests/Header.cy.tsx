import { Provider } from "react-redux";
import { store } from "../redux/store/store";
import { App } from "../App";

describe("<Header />", () => {
  it("renders", () => {
    cy.viewport(1440,1024);
    cy.mount(
      <Provider store={store}>
        <App />
      </Provider>
    );

    cy.get('.header-container').should('exist').and('be.visible');
    cy.get('.app-name').should('exist').and('be.visible').and('have.text', 'Internet Booking Engine');
    cy.get('.bookings-btn').should('exist').and('be.visible').and('have.text', 'MY BOOKINGS');
    cy.get('.login-btn').should('exist').and('be.visible').and('have.text', 'LOGIN');
  });
});
