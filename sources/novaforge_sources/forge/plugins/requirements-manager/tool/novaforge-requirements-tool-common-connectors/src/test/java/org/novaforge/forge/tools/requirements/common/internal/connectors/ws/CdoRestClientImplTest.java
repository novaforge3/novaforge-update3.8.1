/**
 * Copyright ( c ) 2011-2017, BULL SAS, NovaForge Version 3 and above.
 *
 * This file is free software: you may redistribute and/or 
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, version 3 of the License.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see http://www.gnu.org/licenses.
 *
 * Additional permission under GNU AGPL version 3 (AGPL-3.0) section 7
 *
 * If you modify this Program, or any covered work,
 * by linking or combining it with libraries listed
 * in COPYRIGHT file at the top-level directof of this
 * distribution (or a modified version of that libraries),
 * containing parts covered by the terms of licenses cited
 * in the COPYRIGHT file, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 */
package org.novaforge.forge.tools.requirements.common.internal.connectors.ws;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import java.util.List;

import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoRestClient;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Category;


/**
 * @author a111122
 *
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class CdoRestClientImplTest
{
  
  private boolean cdoProfileActivated = false;
  private CdoRestClient cdoRestClient = null;

  
  public CdoRestClientImplTest() {
    
    final String property = System.getProperty("cdo.profile");

    cdoProfileActivated = "true".equals(property);
  
  }
  
  @Before
  public void init() {

    if (cdoProfileActivated) {
      
      this.cdoRestClient = CdoRestClientImpl.getInstance();

    }
  }
  
  @Test 
  public void test01getAllCategories() {
    
   if (cdoProfileActivated) {
      
      try {
        
        this.cdoRestClient.setConnector(CdoDataTest.HOST, CdoDataTest.PORT, CdoDataTest.ADMIN_USER, CdoDataTest.ADMIN_PASWORD);

        List<Category> categories = this.cdoRestClient.getAllCategories(CdoDataTest.WS_REQUIREMENTS_PATH, CdoDataTest.REPOSITORY_NAME, CdoDataTest.PROJECT_NAME, CdoDataTest.REPOSITORY_URI);

        assertNotNull(categories);
       
        assertFalse(categories.isEmpty());
        
      } catch (Exception e) {

        fail(e.getMessage());
      }
    }
  }
}
