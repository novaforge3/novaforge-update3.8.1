package org.sonatype.nexus.security.internal;

import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * servlet exposed for first access from novaforge
 */
@Named("CasLoginService")
@Singleton
public class CasAuthenticationService extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private String loginUrl;

	@Inject
	public CasAuthenticationService(final NovaForgeCasConfigProvider casConfig) {
		loginUrl = casConfig.getLoginUrl();
	}

	public final static String RESOURCE_URI = "/service/local/authentication/cas";

	public String RESOURCE_URI() {
		return RESOURCE_URI;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		redirect(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		redirect(req, resp);
	}

	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		redirect(req, resp);
	}

	private void redirect(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		// on redirige vers CAS, si c'est ok, le user ira vers la success url
		// suite a la validation du token et ne passera pas par la
		resp.sendRedirect(loginUrl);
	}

}
