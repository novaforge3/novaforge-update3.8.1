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

import static org.sonatype.nexus.security.FilterProviderSupport.filterKey;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.eclipse.sisu.inject.Sources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonatype.nexus.security.FilterProviderSupport;

import com.google.inject.AbstractModule;
import com.google.inject.Binder;
import com.google.inject.servlet.ServletModule;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * 
 * Sets up Nexus's security filter configuration with cas filter Sisu.
 */
@Named(value = NovaForgeSecurityFilterModule.ROLE)
public class NovaForgeSecurityFilterModule extends AbstractModule {

	/**
	 * Realm Name
	 */
	public static final String ROLE = "NovaForgeSecurityFilterModule";

	@Override
	protected void configure() {
		bind(filterKey("NovaForgeCasFilter")).toProvider(CasFilterProvider.class);

		final Binder lowPriorityBinder = binder().withSource(Sources.prioritize(Integer.MAX_VALUE));
		lowPriorityBinder.install(new ServletModule() {
			@Override
			protected void configureServlets() {
				this.serve(CasAuthenticationService.RESOURCE_URI).with(CasAuthenticationService.class);
				filter(CasAuthenticationService.RESOURCE_URI).through(NovaForgeCasFilter.class);
				this.serve(CasLogoutService.RESOURCE_URI).with(CasLogoutService.class);
			}
		});
	}

	@Singleton
	static class CasFilterProvider extends FilterProviderSupport {
		@Inject
		CasFilterProvider(final NovaForgeCasFilter filter, final NovaForgeCasConfigProvider casConfig) {
			super(filter);
			filter.setLoginUrl(casConfig.getLoginUrl());
			filter.setEnabled(true);
			filter.setSuccessUrl(casConfig.getSuccessUrl());
		}
	}

}
