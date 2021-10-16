import { CypressCredentials } from '../users';

/**
 * A class which encapsulates UI selectors and actions for the Login Page.
 */
export class LoginPage {
    enterUsername(name: string) {
        cy.get('#username').type(name, { log: false });
    }

    enterPassword(name: string) {
        cy.get('#password').type(name, { log: false });
    }

    clickLoginButton() {
        cy.get('.btn-primary').click();
    }

    login(credentials: CypressCredentials) {
        this.enterUsername(credentials.username);
        this.enterPassword(credentials.password);
        this.clickLoginButton();
    }
}
