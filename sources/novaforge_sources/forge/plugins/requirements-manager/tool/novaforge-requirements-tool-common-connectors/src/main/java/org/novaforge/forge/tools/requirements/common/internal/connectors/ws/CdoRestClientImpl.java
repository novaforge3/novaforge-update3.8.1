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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoClientConnector;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoRestClient;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoRestException;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Categories;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Category;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Requirements;
import org.novaforge.forge.tools.requirements.common.internal.connectors.ws.marshallers.RequirementsUnmarshaller;


/**
 * @author a111122
 *
 */
public class CdoRestClientImpl implements CdoRestClient
{
  private static final Log                  log                  = LogFactory.getLog(CdoRestClientImpl.class);
  
  private CdoClientConnector cdoClientConnector;

  private CdoRestClientImpl(){
    super();
  };
  
  private static CdoRestClientImpl CdoRestClient = new CdoRestClientImpl();
  
  public static CdoRestClientImpl getInstance(){
    return CdoRestClient;
  }
  
  
  public void setConnector(final String pHost, final String pPort,final String pAdminLogin, final String pAdminToken)
      throws CdoRestException
  {
    try
    {
      URL baseUrl = new URL("http://"+ pHost + ":" + pPort);
      this.setCdoClientConnector(new CdoClientConnectorImpl(baseUrl, pAdminLogin, pAdminToken));
    }
    catch (final MalformedURLException e )
    {
      throw new CdoRestException(String.format("Unable to build location : Host=%s - Port=%s)", pHost, pPort));
    } 
  }
  
    
 public List<Category> getAllCategories(final String wsRequirementsPath, final String repositoryName, final String projectName, final String url) throws CdoRestException{
    
    List<Category> ret = new ArrayList<Category>();
    
    CdoClientConnector connector = this.getCdoClientConnector();               
    final String method = connector.getBaseUrl().toExternalForm() + wsRequirementsPath;
    
    final String JSON_STRING = "{"
        +"'repositoryName':'"+ repositoryName +"',"
        +"'projectName':'"+ projectName +"',"
        +"'url': '"+ url +"'"
        + "}";
    
    final PostMethod postMethod = new PostMethod(method); 
      
    try
    {          
         StringRequestEntity requestEntity = new StringRequestEntity(JSON_STRING,
              "application/json",
              "UTF-8");   

        postMethod.setRequestEntity(requestEntity);
                
        final String response =  executePostMethod(connector.getHttpClient(), postMethod);
        
        Requirements requirements = RequirementsUnmarshaller.parse(response);
        
        
        if (!requirements.getStatus().equals("200"))
        {         
          throw new CdoRestException(String.format("The Webservice=%s has returned an error : Status=%s - Message=%s ", wsRequirementsPath, 
              requirements.getStatus(), requirements.getMessage()));           
        }
          
        if (requirements.getRequirements() != null)
        {         
          Categories categories = requirements.getRequirements();
          
          List<Category> categoriesList = categories.getCategories();
          
          for (final Category category : categoriesList)
          {
              ret.add(category);
          }
        }         
        
        return ret;  
  
    }  catch (UnsupportedEncodingException e)
    {
        throw new CdoRestException(e.getMessage());        
    }
    catch (final CdoRestException e) 
    {
      throw new CdoRestException(e.getMessage());        
    }
    catch (final Exception e) 
    {
        throw new CdoRestException(String.format("Unable to parse requirements for Resposiory=%s, Projec=%s, Url=%s.", repositoryName, projectName, url));  
    } 
    finally
    {
     // the inputStream is closed when the connection is released
        postMethod.releaseConnection();
    }         
  }
  
 
  private String executePostMethod(final HttpClient pHttpClient, final PostMethod pMethod) throws CdoRestException
  {
    
    if (log.isDebugEnabled())
    {
      log.debug(String.format("path=%s", pMethod.getPath()));
    }

    String response = new String();
    
    pMethod.setDoAuthentication(true);

    try
    {
      pHttpClient.executeMethod(pMethod);
      if (log.isDebugEnabled())
      {
        log.debug(String.format("Jenkins Response Code Status = %s", pMethod.getStatusCode()));
      }
      
      final boolean result = checkResult(pMethod.getStatusCode());
      if (!result)
      {
        throw new CdoRestException(String.format("Unable to get response ok from method to hostname=%s, port=%s",
                                pMethod.getHostConfiguration().getHost(),
                                pMethod.getHostConfiguration().getPort()));
      }
      
      BufferedReader br = new BufferedReader(new InputStreamReader(pMethod.getResponseBodyAsStream()));
      String readLine;
      while (((readLine = br.readLine()) != null)) {
        response = response.concat(readLine);
      }
      return response;
    }
    catch (final Exception e)
    {
      throw new CdoRestException(String.format("Unable to post method to hostname=%s, port=%s",
                                                  pMethod.getHostConfiguration().getHost(),
                                                  pMethod.getHostConfiguration().getPort()), e);
    }
    finally
    {
      pMethod.releaseConnection();
    }
  }
  
  
  private boolean checkResult(final int pCode)
  {
    boolean result = true;
    if (((pCode / 100) == 4) || ((pCode / 100) == 5))
    {
      result = false;
    }
    return result;
  }

  /**
   * @return the cdoClientConnector
   */
  public CdoClientConnector getCdoClientConnector()
  {
    return cdoClientConnector;
  }

  /**
   * @param cdoClientConnector 
   *		the cdoClientConnector to set
   */
  public void setCdoClientConnector(CdoClientConnector cdoClientConnector)
  {
   this.cdoClientConnector = cdoClientConnector;
  }
  
}
