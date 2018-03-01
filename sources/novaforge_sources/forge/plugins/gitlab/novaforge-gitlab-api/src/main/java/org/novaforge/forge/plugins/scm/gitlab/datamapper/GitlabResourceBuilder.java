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
package org.novaforge.forge.plugins.scm.gitlab.datamapper;

import org.gitlab.api.models.GitlabGroup;
import org.gitlab.api.models.GitlabNamespace;
import org.gitlab.api.models.GitlabProject;
import org.gitlab.api.models.GitlabUser;
import org.novaforge.forge.core.plugins.domain.plugin.PluginProject;
import org.novaforge.forge.core.plugins.domain.plugin.PluginUser;

/**
 * This class is used to defined a service which will be user in order to build object needed to communicate
 * with Jira WS.
 * 
 * @author Gauthier Cart
 */
public interface GitlabResourceBuilder
{

  /**
   * @param pPluginUser
   * @return
   */
  GitlabUser buildGitlabUser(final PluginUser pPluginUser);

  /**
   * @param pPluginProject
   * @param pInstanceName
   * @return
   */
  GitlabProject buildGitlabProject(final PluginProject pPluginProject, final String pInstanceName,
      final GitlabUser pOwner, final GitlabNamespace pNamespace);

  /**
   * @param pInstanceName
   * @return
   */
  GitlabGroup buildGitlabGroup(final String pForgeProjectId, final String pInstanceName);

}
