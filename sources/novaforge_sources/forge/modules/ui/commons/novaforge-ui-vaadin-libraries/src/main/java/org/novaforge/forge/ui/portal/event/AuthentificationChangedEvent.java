/*
 * Copyright (c) 2011-2015, BULL SAS, NovaForge Version 3 and above.
 *
 * This file is free software: you may redistribute and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, version 3 of the License.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see http://www.gnu.org/licenses.
 *
 * Additional permission under GNU AGPL version 3 (AGPL-3.0) section 7.
 *
 * If you modify this Program, or any covered work, by linking or combining
 * it with libraries listed in COPYRIGHT file at the top-level directory of
 * this distribution (or a modified version of that libraries), containing parts
 * covered by the terms of licenses cited in the COPYRIGHT file, the licensors
 * of this Program grant you additional permission to convey the resulting work.
 */
package org.novaforge.forge.ui.portal.event;

import org.novaforge.forge.portal.events.PortalEvent;

/**
 * This event will be thrown when the user authentification has been changed.
 * 
 * @author Guillaume Lamirand
 */
public class AuthentificationChangedEvent implements PortalEvent
{
  /**
   * Current event status
   */
  private final Status status;

  /**
   * Default constructor
   *
   * @param pStatus
   *          the source status
   */
  public AuthentificationChangedEvent(final Status pStatus)
  {
    status = pStatus;
  }

  /**
   * Get the event {@link Status}
   *
   * @return the event status
   */
  public Status getStatus()
  {
    return status;
  }

  /**
   * This enum defines the status available for {@link AuthentificationChangedEvent} event
   *
   * @author Guillaume Lamirand
   */
  public enum Status
  {
    /**
     * This status is used when the user is logged in
     */
    AUTHENTIFICATED,

    /**
     * This status is used when the user is logged out
     */
    UNAUTHENTIFICATED
  }
}
