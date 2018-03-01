package org.sonatype.nexus.security.internal;

import java.io.IOException;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.cas.CasFilter;
import org.apache.shiro.mgt.RealmSecurityManager;
import org.apache.shiro.nexus.NexusWebSecurityManager;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;
import org.apache.shiro.web.servlet.ShiroHttpServletRequest;
import org.apache.shiro.web.servlet.ShiroHttpServletResponse;
import org.apache.shiro.web.subject.WebSubject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * 
 * implements novaforge cas authenticationfilter
 */
@Singleton
@Named(value = "NovaForgeCasFilter")
public class NovaForgeCasFilter extends CasFilter {

	/**
	 * Logger
	 */
	private static Logger log = LoggerFactory.getLogger(NovaForgeCasFilter.class);
	private NexusWebSecurityManager nxWebsecurityMgr = null;
	private RealmSecurityManager realmSecurityManager = null;

	@Inject
	public NovaForgeCasFilter(NexusWebSecurityManager myNxWebsecurityMgr, RealmSecurityManager rsm) {

		nxWebsecurityMgr = myNxWebsecurityMgr;
		realmSecurityManager = rsm;
	}

	@Override
	protected boolean isLoginRequest(ServletRequest request, ServletResponse response) {
		return super.isLoginRequest(request, response);
	}

	/**
	 * If login has been successful, redirect user to the original protected
	 * url.
	 * 
	 * @param token
	 *            the token representing the current authentication
	 * @param subject
	 *            the current authenticated subjet
	 * @param request
	 *            the incoming request
	 * @param response
	 *            the outgoing response
	 * @throws Exception
	 *             if there is an error processing the request.
	 */
	@Override
	protected boolean onLoginSuccess(AuthenticationToken token, Subject subject, ServletRequest request,
			ServletResponse response) throws Exception {
		((HttpServletResponse) response).sendRedirect(getSuccessUrl());
		return false;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		try {
			if (CasUtil.hasCasTicket(request)) {
				// after being redirected to cas login page, we access nexus
				// with cas ticket
				if (nxWebsecurityMgr.getRealms() == null
						|| nxWebsecurityMgr.getRealms() != realmSecurityManager.getRealms()) {
					nxWebsecurityMgr.setRealms(realmSecurityManager.getRealms());
				}
				final ServletRequest req = prepareServletRequest(request, response, chain);
				final ServletResponse resp = prepareServletResponse(req, response, chain);

				final Subject subject = createSubject(req, resp);
				// mandatory otherwise subject is lost
				ThreadContext.bind(subject);

				boolean resLogin = executeLogin(req, resp);
				if (!resLogin) {
					log.error("error during CAS login");
					;
				} else {
					// redirection already occurred after executeLogin
					// instruction
					// break filter chain
					return;
				}
			} else {
				// first access to CAS authentication url (no ticket in url), we
				// redirect to cas login
				((HttpServletResponse) response).sendRedirect(getLoginUrl());
				// break filter chain
				return;
			}
		} catch (Exception e) {
			throw new ServletException(e);
		}
		super.doFilterInternal(request, response, chain);
	}

	private WebSubject createSubject(ServletRequest request, ServletResponse response) {
		return new WebSubject.Builder(nxWebsecurityMgr, request, response).buildWebSubject();
	}

	private ServletResponse prepareServletResponse(ServletRequest request, ServletResponse response,
			FilterChain chain) {
		ServletResponse toUse = response;
		if (!isHttpSessions() && (request instanceof ShiroHttpServletRequest)
				&& (response instanceof HttpServletResponse)) {
			// the ShiroHttpServletResponse exists to support URL rewriting for
			// session ids. This is only needed if
			// using Shiro sessions (i.e. not simple HttpSession based
			// sessions):
			toUse = wrapServletResponse((HttpServletResponse) response, (ShiroHttpServletRequest) request);
		}
		return toUse;
	}

	private ServletRequest prepareServletRequest(ServletRequest request, ServletResponse response, FilterChain chain) {
		ServletRequest toUse = request;
		if (request instanceof HttpServletRequest) {
			HttpServletRequest http = (HttpServletRequest) request;
			toUse = wrapServletRequest(http);
		}
		return toUse;
	}

	private ServletResponse wrapServletResponse(HttpServletResponse orig, ShiroHttpServletRequest request) {
		return new ShiroHttpServletResponse(orig, getServletContext(), request);
	}

	private ServletRequest wrapServletRequest(HttpServletRequest orig) {
		return new ShiroHttpServletRequest(orig, getServletContext(), isHttpSessions());
	}

	private boolean isHttpSessions() {
		return nxWebsecurityMgr.isHttpSessionMode();
	}

}
