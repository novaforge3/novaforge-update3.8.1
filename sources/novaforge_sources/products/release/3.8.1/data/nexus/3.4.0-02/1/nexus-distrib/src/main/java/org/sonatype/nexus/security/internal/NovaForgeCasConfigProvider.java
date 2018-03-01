package org.sonatype.nexus.security.internal;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * 
 * provides cas configuration from config-file defined by cas-config system
 * property
 */
@Singleton
@Named(value = "NovaForgeCasConfigProvider")
public class NovaForgeCasConfigProvider {

	/**
	 * Logger
	 */
	private static Logger log = LoggerFactory.getLogger(NovaForgeCasConfigProvider.class);

	/**
	 * Default name of the CAS attribute for remember me authentication (CAS
	 * 3.4.10+)
	 */
	public static final String DEFAULT_REMEMBER_ME_ATTRIBUTE_NAME = "longTermAuthenticationRequestTokenUsed";
	/**
	 * Default validation protocol
	 */
	public static final String DEFAULT_VALIDATION_PROTOCOL = "CAS";
	/**
	 * Default cas url
	 */
	private static final String DEFAULT_CAS_URL = "https://localhost:8443/cas";
	/**
	 * Default cas service
	 */
	private static final String DEFAULT_CAS_SERVICE = "http://localhost:8081/nexus/service/local/authentication/cas";

	private String loginUrl;
	private String logoutUrl;
	private String failureUrl;
	private String successUrl;

	/**
	 * CAS protocol to use for ticket validation : CAS (default) or SAML : - CAS
	 * protocol can be used with CAS server version < 3.1 : in this case, no
	 * user attributes can be retrieved from the CAS ticket validation response
	 * (except if there are some customizations on CAS server side) - SAML
	 * protocol can be used with CAS server version >= 3.1 : in this case, user
	 * attributes can be extracted from the CAS ticket validation response
	 */
	private String validationProtocol = DEFAULT_VALIDATION_PROTOCOL;

	/**
	 * Name of the CAS attribute for remember me authentication (CAS 3.4.10+)
	 */
	private String rememberMeAttributeName = DEFAULT_REMEMBER_ME_ATTRIBUTE_NAME;
	/**
	 * Url to contact cas server
	 */
	private String casServerUrlPrefix = DEFAULT_CAS_URL;
	/**
	 * Url of cas service return url
	 */
	private String casService = DEFAULT_CAS_SERVICE;

	@Inject
	public NovaForgeCasConfigProvider() {
		// Get system property defined by nexus wrapper
		String casConfigFile = System.getProperty("cas-config");
		log.debug("cas-config=" + System.getProperty("cas-config"));
		if (casConfigFile != null && !casConfigFile.equals("")) {

			try {
				final File nexusPropertiesFile = new File(casConfigFile);

				final Properties casProperties = new Properties();
				casProperties.load(new FileInputStream(nexusPropertiesFile));

				// get the values of the properties
				casServerUrlPrefix = casProperties.getProperty("casServerUrlPrefix", DEFAULT_CAS_URL);
				log.debug("casServerUrlPrefix=" + casServerUrlPrefix);
				casService = casProperties.getProperty("casService", DEFAULT_CAS_SERVICE);
				log.debug("casService=" + casService);
				validationProtocol = casProperties.getProperty("validationProtocol", DEFAULT_VALIDATION_PROTOCOL);
				log.debug("validationProtocol=" + validationProtocol);
				rememberMeAttributeName = casProperties.getProperty("rememberMeAttributeName",
						DEFAULT_REMEMBER_ME_ATTRIBUTE_NAME);
				log.debug("rememberMeAttributeName=" + rememberMeAttributeName);
				loginUrl = casProperties.getProperty("casLoginUrl", DEFAULT_CAS_URL);
				log.debug("loginUrl=" + loginUrl);
				failureUrl = casProperties.getProperty("casFailureUrl", DEFAULT_CAS_URL);
				log.debug("failureUrl=" + failureUrl);
				successUrl = casProperties.getProperty("casSuccessUrl", DEFAULT_CAS_URL);
				log.debug("successUrl=" + successUrl);
				logoutUrl = casProperties.getProperty("casLogoutUrl", DEFAULT_CAS_URL);
			} catch (final FileNotFoundException e) {
				log.error("The properties file {} used for CAS is not found", new Object[] { casConfigFile });
			} catch (final IOException e) {
				log.error("Unable to load properties file {} used for CAS is not found",
						new Object[] { "conf/cas.properties" });
			}

		}
	}

	public String getLoginUrl() {
		return loginUrl;
	}

	public void setLoginUrl(String loginUrl) {
		this.loginUrl = loginUrl;
	}

	public String getFailureUrl() {
		return failureUrl;
	}

	public void setFailureUrl(String failureUrl) {
		this.failureUrl = failureUrl;
	}

	public String getSuccessUrl() {
		return successUrl;
	}

	public void setSuccessUrl(String successUrl) {
		this.successUrl = successUrl;
	}

	public String getCasServerUrlPrefix() {
		return casServerUrlPrefix;
	}

	public void setCasServerUrlPrefix(String casServerUrlPrefix) {
		this.casServerUrlPrefix = casServerUrlPrefix;
	}

	public String getCasService() {
		return casService;
	}

	public void setCasService(String casService) {
		this.casService = casService;
	}

	public String getValidationProtocol() {
		return validationProtocol;
	}

	public void setValidationProtocol(String validationProtocol) {
		this.validationProtocol = validationProtocol;
	}

	public String getRememberMeAttributeName() {
		return rememberMeAttributeName;
	}

	public void setRememberMeAttributeName(String rememberMeAttributeName) {
		this.rememberMeAttributeName = rememberMeAttributeName;
	}

	public String getLogoutUrl() {
		return logoutUrl;
	}

	public void setLogoutUrl(String logoutUrl) {
		this.logoutUrl = logoutUrl;
	}

}
