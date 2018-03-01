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

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;

/**
 * ============================================================================
 * Patch Novaforge to support the CAS Authentication
 * ============================================================================
 * ============================================================================
 * 
 */
public class CasUtil {

	/**
	 * The name of the parameter service ticket in url
	 */
	private static final String TICKET_PARAMETER = "ticket";

	public static boolean hasCasTicket(final ServletRequest pRequest) {
		boolean returnValue = false;
		final HttpServletRequest httpRequest = (HttpServletRequest) pRequest;
		final String ticket = httpRequest.getParameter(TICKET_PARAMETER);
		if (ticket != null) {
			returnValue = true;
		}
		return returnValue;
	}
}
