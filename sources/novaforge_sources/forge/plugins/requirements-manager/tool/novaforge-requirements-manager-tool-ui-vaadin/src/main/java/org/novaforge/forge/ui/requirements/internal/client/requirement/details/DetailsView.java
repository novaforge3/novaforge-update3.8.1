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
package org.novaforge.forge.ui.requirements.internal.client.requirement.details;

import com.vaadin.ui.Button;
import com.vaadin.ui.ComponentContainer;
import com.vaadin.ui.Label;

import java.util.Locale;

/**
 * @author Jeremy Casery
 */
public interface DetailsView extends ComponentContainer
{

  /**
   * Should be called to refresh view according to the {@link Locale} given
   * 
   * @param pLocale
   *          the new locale
   */
  void refreshLocale(Locale pLocale);

  /**
   * Get the header title {@link Label}
   * 
   * @return the label
   */
  Label getHeaderTitle();

  /**
   * Get the header close {@link Button}
   * 
   * @return the button
   */
  Button getHeaderCloseButton();

  /**
   * Get the type value {@link Label}
   * 
   * @return the label
   */
  Label getTypeValue();

  /**
   * Get the version value {@link Label}
   * 
   * @return the label
   */
  Label getVersionValue();

  /**
   * Get the object reference value {@link Label}
   * 
   * @return the label
   */
  Label getObjRefValue();

  /**
   * Get the name value {@link Label}
   * 
   * @return the label
   */
  Label getNameValue();

  /**
   * Get the status value {@link Label}
   * 
   * @return the label
   */
  Label getStatusValue();

  /**
   * Get the description value {@link Label}
   * 
   * @return the label
   */
  Label getDescValue();

  /**
   * Get the acceptance criteria value {@link Label}
   * 
   * @return the label
   */
  Label getAccepCritValue();

  /**
   * Set the requirement ID
   * 
   * @param requirementID
   *          to set
   */
  void setRequirementID(String requirementID);

  /**
   * Get the status value {@link Label}
   * 
   * @return the label
   */
  Label getStatusLabel();

  /**
   * Define if details view is in popup mode or slide mode (default)
   * 
   * @param pIsPopupMode
   */
  void setPopupMode(boolean pIsPopupMode);

}
