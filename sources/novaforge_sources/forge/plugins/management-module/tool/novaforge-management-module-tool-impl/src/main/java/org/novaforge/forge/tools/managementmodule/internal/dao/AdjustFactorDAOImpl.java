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
package org.novaforge.forge.tools.managementmodule.internal.dao;

import org.novaforge.forge.tools.managementmodule.dao.AdjustFactorDAO;
import org.novaforge.forge.tools.managementmodule.domain.AdjustFactor;
import org.novaforge.forge.tools.managementmodule.entity.AdjustFactorEntity;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.LinkedList;
import java.util.List;

/**
 * @author fdemange
 */
public class AdjustFactorDAOImpl implements AdjustFactorDAO
{
	/**
	 * {@link EntityManager} injected by container
	 */
	private EntityManager entityManager;

	/**
	 * Use by container to inject {@link EntityManager}
	 * 
	 * @param pEntityManager
	 *          the entityManager to set
	 */
	public void setEntityManager(final EntityManager pEntityManager)
	{
		this.entityManager = pEntityManager;
	}

	/*
	 * (non-Javadoc)
	 * @see
	 * org.novaforge.forge.plugins.managementmodule.remote.AdjustFactorDAORemote#findByName(java.lang.String)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public AdjustFactor findByName(final String pName)
	{
		Query q = entityManager.createNamedQuery("AdjustFactorEntity.findByName");
		q.setParameter("name", pName);

		List<AdjustFactor> results = new LinkedList<AdjustFactor>(q.getResultList());

		if (results.size() > 0)
		{
			return results.get(0);
		}
		else
		{
			return null;
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public AdjustFactor save(final AdjustFactor pAdjustF)
	{
		entityManager.persist(pAdjustF);
		entityManager.flush();
		return pAdjustF;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public List<AdjustFactor> findAll()
	{
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaQuery<AdjustFactor> countCriteria = builder.createQuery(AdjustFactor.class);
		Root<AdjustFactorEntity> entityRoot = countCriteria.from(AdjustFactorEntity.class);
		countCriteria.select(entityRoot);
		return new LinkedList<AdjustFactor>(entityManager.createQuery(countCriteria).getResultList());
	}

}
