package org.sonatype.nexus.security.internal;

import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * servlet exposed for logout
 */
@Named("CasLogoutService")
@Singleton
public class CasLogoutService extends HttpServlet {

	private String logoutUrl;

	@Inject
	public CasLogoutService(final NovaForgeCasConfigProvider casConfig) {
		logoutUrl = casConfig.getLogoutUrl();
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public final static String RESOURCE_URI = "/service/local/authentication/cas/logout";

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
		Subject subject = ThreadContext.getSubject();
		subject.logout();
		// on redirige vers CAS, si c'est ok, le user ira vers la success url
		// suite a la validation du token et ne passera pas par la
		resp.sendRedirect(logoutUrl);
	}

}
