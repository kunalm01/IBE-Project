describe("template spec", () => {
  beforeEach(() => {
    cy.viewport(1440, 1024);
  });

  it("<Header />", () => {
    cy.visit("http://localhost:5173");
    cy.wait(1000);
    cy.get(".header-container").should("exist").and("be.visible");
    cy.get(".app-name")
      .should("exist")
      .and("be.visible")
      .and("have.text", "Internet Booking Engine");
    cy.get(".bookings-btn")
      .should("exist")
      .and("be.visible")
      .and("have.text", "MY BOOKINGS");
    cy.get(".login-btn")
      .should("exist")
      .and("be.visible")
      .and("have.text", "LOGIN");
  });

  it("<Footer />", () => {
    cy.visit("http://localhost:5173");
    cy.wait(1000);
    cy.get(".footer-container").should("exist").and("be.visible");
    cy.get(".copyright-container")
      .should("exist")
      .and("be.visible")
      .contains("All rights reserved");
  });

  it("<LandingPage /> ", () => {
    cy.visit("http://localhost:5173");
    cy.wait(1000);
    cy.get(".property-search-title").should("exist").contains("Property name*");

    cy.get(".property-title").should("exist").contains("Search all properties");

    cy.get(".property-search-container").should(
      "not.have.class",
      "property-search-container-active"
    );
    cy.get(".property-search-container").click();
    cy.get(".property-search-container").should(
      "have.class",
      "property-search-container-active"
    );
    cy.get(".dropdown-container")
      .should("be.visible")
      .contains("Team 11 Hotel")
      .click();

    cy.get(".date-select-container").should("not.have.class", "date-active");
    cy.get(".date-select-container").click();
    cy.get(".date-select-container").should("have.class", "date-active");
    cy.get(".apply-btn").should("exist").click();

    cy.get(".guests-info").should("not.have.class", "guests-active");
    cy.get(".guests-info").click();
    cy.get(".guests-info").should("have.class", "guests-active").click();

    cy.get(".rooms-info").should("not.have.class", "rooms-active");
    cy.get(".rooms-info").click();
    cy.get(".rooms-info").should("have.class", "rooms-active");

    cy.get("#wheelchair-checkbox").should("not.be.checked");
    cy.get("#wheelchair-checkbox").click();
    cy.get("#wheelchair-checkbox").should("be.checked");

    cy.get(".search-btn")
      .should("exist")
      .contains("SEARCH")
      .should("not.be.disabled");
  });

  it("<RoomResults /> ", () => {
    cy.visit('http://localhost:5173/rooms');
    cy.wait(1000);

    cy.get(".room-results-container").should("exist").and("be.visible");

    cy.get(".search-parameters-container").should("exist").and("be.visible");

    cy.get(".guests-info").should("exist").and("be.visible").click();
    cy.get(".rooms-info").should("exist").and("be.visible").click();
    cy.get(".date-select-container").should("exist").and("be.visible").click();
    cy.get(".apply-btn").should("exist").and("be.visible").click();

    cy.get(".sort-wrapper").should("exist").and("be.visible");
    cy.get(".sort").click();
    cy.get(".sort-dropdown-container")
      .should("exist")
      .and("be.visible")
      .contains("Price")
      .click();

    cy.get(".filters-container").should("exist").and("be.visible");
    cy.get(".room")
      .first()
      .should("have.class", ".room-details")
      .should("have.class", ".inclusive")
      .and("have.text", "Inclusive");
  });
});
