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
package org.novaforge.forge.tools.requirements.common.internal.services;

import org.novaforge.forge.tools.requirements.common.entity.DirectoryEntity;
import org.novaforge.forge.tools.requirements.common.entity.ProjectEntity;
import org.novaforge.forge.tools.requirements.common.entity.RepositoryEntity;
import org.novaforge.forge.tools.requirements.common.entity.RequirementEntity;
import org.novaforge.forge.tools.requirements.common.entity.RequirementVersionEntity;
import org.novaforge.forge.tools.requirements.common.entity.ResourceOOEntity;
import org.novaforge.forge.tools.requirements.common.entity.SchedulingConfigurationEntity;
import org.novaforge.forge.tools.requirements.common.entity.TaskEntity;
import org.novaforge.forge.tools.requirements.common.entity.TestEntity;
import org.novaforge.forge.tools.requirements.common.factories.RequirementFactory;
import org.novaforge.forge.tools.requirements.common.model.EDirectoryLevel;
import org.novaforge.forge.tools.requirements.common.model.IDirectory;
import org.novaforge.forge.tools.requirements.common.model.IProject;
import org.novaforge.forge.tools.requirements.common.model.IRepository;
import org.novaforge.forge.tools.requirements.common.model.IRequirement;
import org.novaforge.forge.tools.requirements.common.model.IRequirementVersion;
import org.novaforge.forge.tools.requirements.common.model.IResourceOOCode;
import org.novaforge.forge.tools.requirements.common.model.ITask;
import org.novaforge.forge.tools.requirements.common.model.ITest;
import org.novaforge.forge.tools.requirements.common.model.scheduling.SchedulingConfiguration;

public class RequirementFactoryJPAImpl implements RequirementFactory
{
  @Override
  public IRequirement buildNewRequirement()
  {
    return new RequirementEntity();
  }

  @Override
  public IRequirementVersion buildNewRequirementVersion()
  {
    return new RequirementVersionEntity();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public IResourceOOCode buildNewResourceCode()
  {
    return new ResourceOOEntity();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public ITest buildNewFunctionalTest()
  {
    return new TestEntity();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public IProject buildNewProject()
  {
    return new ProjectEntity();
  }

  @Override
  public IRepository buildNewRepository()
  {
    return new RepositoryEntity();
  }

  @Override
  public IDirectory buildNewDirectory(final EDirectoryLevel pRoot)
  {

    return new DirectoryEntity();
  }

  @Override
  public ITask buildNewTask()
  {
    return new TaskEntity();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public SchedulingConfiguration buildNewSchedulingConfiguration()
  {
    return new SchedulingConfigurationEntity();
  }

}