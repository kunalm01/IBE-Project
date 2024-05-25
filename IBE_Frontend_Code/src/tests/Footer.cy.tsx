import { Provider } from 'react-redux';
import { store } from '../redux/store/store';
import { App } from '../App';

describe('<Footer />', () => {
  it("renders", () => {
    cy.viewport(1440,1024);
    cy.mount(
      <Provider store={store}>
        <App />
      </Provider>
    );

    cy.get('.footer-container').should('exist').and('be.visible');
    cy.get('.copyright-container').should('exist').and('be.visible').contains('© Kickdrum Technology Group LLC.');
  });
})