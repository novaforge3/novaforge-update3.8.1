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
package org.novaforge.forge.core.organization.model.enumerations;

import java.util.HashMap;
import java.util.Map;

/**
 * @author benoists
 */
public enum RealmType
{
  SYSTEM
  {
    @Override
    public String getLabel()
    {
      return "SYSTEM";
    }
  },

  ANONYMOUS
  {
    @Override
    public String getLabel()
    {
      return "ANONYMOUS";
    }
  },

  USER
  {
    @Override
    public String getLabel()
    {
      return "USER";
    }
  };

  private static final Map<String, RealmType> types = new HashMap<String, RealmType>();

  static
  {
    for (final RealmType type : values())
    {
      types.put(type.getLabel(), type);
    }
  }

  /**
   * Return the {@link PluginRealm} from its label
   *
   * @param pLabel
   *          the type's label
   * @return {@link PluginRealm} according its label
   */
  public static RealmType fromLabel(final String pLabel)
  {
    return types.get(pLabel);
  }

  public abstract String getLabel();

}
