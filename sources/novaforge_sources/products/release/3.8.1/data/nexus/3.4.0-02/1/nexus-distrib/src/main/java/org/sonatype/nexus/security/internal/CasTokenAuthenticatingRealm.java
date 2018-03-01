/**
 * NovaForge(TM) is a web-based forge offering a Collaborative Development and 
 * Project Management Environment.
 *
 * Copyright (C) 2007-2012  BULL SAS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/.
 */

package org.sonatype.nexus.security.internal;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.enterprise.inject.Typed;
import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.credential.CredentialsMatcher;
import org.apache.shiro.authc.credential.SimpleCredentialsMatcher;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.cache.CacheManager;
import org.apache.shiro.cas.CasAuthenticationException;
import org.apache.shiro.cas.CasRealm;
import org.apache.shiro.cas.CasToken;
import org.apache.shiro.realm.AuthenticatingRealm;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.SimplePrincipalCollection;
import org.apache.shiro.util.StringUtils;

import org.jasig.cas.client.authentication.AttributePrincipal;
import org.jasig.cas.client.validation.Assertion;
import org.jasig.cas.client.validation.Cas20ServiceTicketValidator;
import org.jasig.cas.client.validation.Saml11TicketValidator;
import org.jasig.cas.client.validation.TicketValidationException;
import org.jasig.cas.client.validation.TicketValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonatype.inject.Description;
import org.sonatype.nexus.security.SecuritySystem;
import org.sonatype.nexus.security.role.RoleIdentifier;
import org.sonatype.nexus.security.user.RoleMappingUserManager;
import org.sonatype.nexus.security.user.UserManager;
import org.sonatype.nexus.security.user.UserNotFoundException;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * * This realm is used when a ticket validation is received from CAS protocol.
 * It is based on {@link CasRealm}
 * 
 */
@Singleton
@Typed(Realm.class)
@Named(value = CasTokenAuthenticatingRealm.ROLE)
@Description(value = "NovaForge CAS Authenticating Realm")
public class CasTokenAuthenticatingRealm extends AuthorizingRealm implements Realm {

	public static final String NAME = "CasTokenAuthenticatingRealm";

	/**
	 * Realm Name
	 */
	public static final String ROLE = "CasTokenAuthenticatingRealm";

	/**
	 * Logger
	 */
	private static Logger log = LoggerFactory.getLogger(CasTokenAuthenticatingRealm.class);

	/**
	 * CAS protocol to use for ticket validation : CAS (default) or SAML : - CAS
	 * protocol can be used with CAS server version < 3.1 : in this case, no
	 * user attributes can be retrieved from the CAS ticket validation response
	 * (except if there are some customizations on CAS server side) - SAML
	 * protocol can be used with CAS server version >= 3.1 : in this case, user
	 * attributes can be extracted from the CAS ticket validation response
	 */
	private String validationProtocol;

	/**
	 * Name of the CAS attribute for remember me authentication (CAS 3.4.10+)
	 */
	private String rememberMeAttributeName;
	/**
	 * Url to contact cas server
	 */
	private String casServerUrlPrefix;
	/**
	 * Url of cas service return url
	 */
	private String casService;

	/**
	 * This class from the CAS client is used to validate a service ticket on
	 * CAS server
	 */
	private TicketValidator ticketValidator;

	private final UserManager userManager;

	private final Map<String, UserManager> userManagerMap;

	private final SecuritySystem securitySystem;

	private final Map<String, Realm> availableRealms;

	/**
	 * Default constructor.
	 */
	@Inject
	public CasTokenAuthenticatingRealm(final UserManager userManager, final SecuritySystem securitySystem,
			final Map<String, UserManager> userManagerMap, final Map<String, Realm> availableRealms,
			final NovaForgeCasConfigProvider casConfig) {
		super();
		internalInit(casConfig);
		this.userManager = userManager;
		this.securitySystem = securitySystem;
		this.userManagerMap = userManagerMap;
		this.availableRealms = availableRealms;
		ensureTicketValidator();
	}

	private void internalInit(NovaForgeCasConfigProvider casConfig) {
		// Get system property defined by nexus wrapper
		casServerUrlPrefix = casConfig.getCasServerUrlPrefix();
		casService = casConfig.getCasService();
		validationProtocol = casConfig.getValidationProtocol();
		rememberMeAttributeName = casConfig.getRememberMeAttributeName();

		// Set token class managed by this realm
		setAuthenticationTokenClass(CasToken.class);
		setName(ROLE);
	}

	private TicketValidator ensureTicketValidator() {
		if (ticketValidator == null) {
			ticketValidator = createTicketValidator();
		}
		return ticketValidator;
	}

	private TicketValidator createTicketValidator() {
		final String urlPrefix = getCasServerUrlPrefix();
		log.debug("urlPrefix=" + urlPrefix);
		log.debug("getValidationProtocol()=" + getValidationProtocol());
		if ("saml".equalsIgnoreCase(getValidationProtocol())) {
			return new Saml11TicketValidator(urlPrefix);
		}
		return new Cas20ServiceTicketValidator(urlPrefix);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(final PrincipalCollection principals) {
		// retrieve user information
		SimplePrincipalCollection principalCollection = (SimplePrincipalCollection) principals;
		List<Object> listPrincipals = principalCollection.asList();
		final Map<String, String> attributes;
		if (listPrincipals.size() > 2)
			attributes = (Map<String, String>) listPrincipals.get(1);
		else
			attributes = new HashMap<String, String>();
		// create simple authorization info
		SimpleAuthorizationInfo simpleAuthorizationInfo = new SimpleAuthorizationInfo();
		// add default roles
		addRoles(simpleAuthorizationInfo, split(defaultRoles));
		// add default permissions
		addPermissions(simpleAuthorizationInfo, split(defaultPermissions));
		// get roles from attributes
		List<String> attributeNames = split(roleAttributeNames);
		for (String attributeName : attributeNames) {
			String value = attributes.get(attributeName);
			addRoles(simpleAuthorizationInfo, split(value));
		}

		final Set<String> realmNames = new HashSet<String>(principals.getRealmNames());
		final Set<String> roles = new HashSet<String>();
		final String username = principals.getPrimaryPrincipal().toString();

		if (RoleMappingUserManager.class.isInstance(userManager)) {
			for (final String realmName : realmNames) {
				try {
					// add default source roles. We only manage one source
					// repository for roles
					for (final RoleIdentifier roleIdentifier : ((RoleMappingUserManager) userManager)
							.getUsersRoles(username, "default")) {
						roles.add(roleIdentifier.getRoleId());
					}
				} catch (final UserNotFoundException e) {
					if (log.isTraceEnabled()) {
						log.trace("Failed to find role mappings for user: " + username + " realm: " + realmName);
					}
				}
			}
		} else if (realmNames.contains("default")) {
			try {
				for (final RoleIdentifier roleIdentifier : userManager.getUser(username).getRoles()) {
					roles.add(roleIdentifier.getRoleId());
				}
			} catch (final UserNotFoundException e) {
				throw new AuthorizationException(
						"User for principals: " + principals.getPrimaryPrincipal() + " could not be found.", e);
			}

		}

		// get permissions from attributes
		attributeNames = split(permissionAttributeNames);
		for (String attributeName : attributeNames) {
			String value = attributes.get(attributeName);
			addPermissions(simpleAuthorizationInfo, split(value));
		}
		simpleAuthorizationInfo.setRoles(roles);

		return simpleAuthorizationInfo;

	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(final AuthenticationToken token)
			throws AuthenticationException {
		final CasToken casToken = (CasToken) token;
		if (token == null) {
			return null;
		}

		final String ticket = (String) casToken.getCredentials();
		if (!StringUtils.hasText(ticket)) {
			return null;
		}
		try {
			// contact CAS server to validate service ticket
			final Assertion casAssertion = ticketValidator.validate(ticket, getCasService());
			// get principal, user id and attributes
			final AttributePrincipal casPrincipal = casAssertion.getPrincipal();
			final String userId = casPrincipal.getName();
			log.debug("Validate ticket : {} in CAS server : {} to retrieve user : {}",
					new Object[] { ticket, getCasServerUrlPrefix(), userId });

			final Map<String, Object> attributes = casPrincipal.getAttributes();
			// refresh authentication token (user id + remember me)
			casToken.setUserId(userId);
			final String rememberMeAttributeName = getRememberMeAttributeName();
			final String rememberMeStringValue = (String) attributes.get(rememberMeAttributeName);
			final boolean isRemembered = (rememberMeStringValue != null) && Boolean.parseBoolean(rememberMeStringValue);
			if (isRemembered) {
				casToken.setRememberMe(true);
			}
			// create simple authentication info
			return new SimpleAuthenticationInfo(userId, ticket, getName());
		} catch (final TicketValidationException e) {
			throw new CasAuthenticationException("Unable to validate ticket [" + ticket + "]", e);
		}
	}

	/**
	 * @return cas server url
	 */
	public String getCasServerUrlPrefix() {
		return casServerUrlPrefix;
	}

	/**
	 * @return cas service url
	 */
	public String getCasService() {
		return casService;
	}

	/**
	 * @return validation protocol
	 */
	public String getValidationProtocol() {
		return validationProtocol;
	}

	/**
	 * @return cas remember me attribute
	 */
	public String getRememberMeAttributeName() {
		return rememberMeAttributeName;
	}

	// default roles to applied to authenticated user
	private String defaultRoles;

	// default permissions to applied to authenticated user
	private String defaultPermissions;

	// names of attributes containing roles
	private String roleAttributeNames;

	// names of attributes containing permissions
	private String permissionAttributeNames;

	public String getDefaultRoles() {
		return defaultRoles;
	}

	public void setDefaultRoles(String defaultRoles) {
		this.defaultRoles = defaultRoles;
	}

	public String getDefaultPermissions() {
		return defaultPermissions;
	}

	public void setDefaultPermissions(String defaultPermissions) {
		this.defaultPermissions = defaultPermissions;
	}

	public String getRoleAttributeNames() {
		return roleAttributeNames;
	}

	public void setRoleAttributeNames(String roleAttributeNames) {
		this.roleAttributeNames = roleAttributeNames;
	}

	public String getPermissionAttributeNames() {
		return permissionAttributeNames;
	}

	public void setPermissionAttributeNames(String permissionAttributeNames) {
		this.permissionAttributeNames = permissionAttributeNames;
	}

	/**
	 * Split a string into a list of not empty and trimmed strings, delimiter is
	 * a comma.
	 * 
	 * @param s
	 *            the input string
	 * @return the list of not empty and trimmed strings
	 */
	private List<String> split(String s) {
		List<String> list = new ArrayList<String>();
		String[] elements = StringUtils.split(s, ',');
		if (elements != null && elements.length > 0) {
			for (String element : elements) {
				if (StringUtils.hasText(element)) {
					list.add(element.trim());
				}
			}
		}
		return list;
	}

	/**
	 * Add roles to the simple authorization info.
	 * 
	 * @param simpleAuthorizationInfo
	 * @param roles
	 *            the list of roles to add
	 */
	private void addRoles(SimpleAuthorizationInfo simpleAuthorizationInfo, List<String> roles) {
		for (String role : roles) {
			simpleAuthorizationInfo.addRole(role);
		}
	}

	/**
	 * Add permissions to the simple authorization info.
	 * 
	 * @param simpleAuthorizationInfo
	 * @param permissions
	 *            the list of permissions to add
	 */
	private void addPermissions(SimpleAuthorizationInfo simpleAuthorizationInfo, List<String> permissions) {
		for (String permission : permissions) {
			simpleAuthorizationInfo.addStringPermission(permission);
		}
	}

}
