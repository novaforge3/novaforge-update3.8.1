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

/**
 * @author a111122
 *
 */
public class CdoDataTest
{
  public final static String HOST = "localhost";
  public final static String PORT = "8888";
  public final static String ADMIN_USER = "novadmin";
  public final static String ADMIN_PASWORD = "novaforge_1";
  public final static String REPOSITORY_NAME = "designer-server";
  // Mode WebService Obeo
  //public final static String WS_REQUIREMENTS_PATH = "/api/v1.0/specific/getRequirements";
  // Mode bouchon
  public final static String WS_REQUIREMENTS_PATH = "/rest-ws/api/requirements";
  public final static String PROJECT_NAME = "projet_pfe_exigences";
  public final static String REPOSITORY_URI = "LibrairieVirtuelle/LibrairieVirtuelle.requirement";
  
  public final static String JSON_STRING = ""
     + " { "
     + "'requirements': { "
  //   + "'cdoId':'OID6253',"
   //  + "'repositoryName': 'LibrairieVirtuelle' , "
     + "'categories': "
      + "["
            + "{'cdoId':'OID01',"
            + "'id':1,"
            + "'categoryName':'CAT1',"
            + "'categories':[],'"
            + "requirements':"
                  + "["
                    + "{"
                        + "'cdoId':'OID02',"
                        + "'id':3,"
                        + "'name':'RQ2',"
                        + "'version':'1',"
                        + "'statement':'',"
                        + "'rationale':'RAT2',"
                        + "'acceptanceCriteria':'',"
                        + "'type':'technical',"
                        + "'subType':'',"
                        + "'status':'OK',"
                        + "'createdOn':'2017-11-07 17:10:17',"
                        + "'modifiedOn':'2017-11-07 17:19:24'"
                        + "},"
                    + "{"
                        + "'cdoId':'OID03',"
                        + "'id':4,"
                        + "'name':'RQ1',"
                        + "'version':'1',"
                        + "'statement':'',"
                        + "'rationale':'RAT1',"
                        + "'acceptanceCriteria':'',"
                        + "'type':'functional',"
                        + "'subType':'',"
                        + "'status':'KO',"
                        + "'createdOn':'2017-11-07 17:01:14',"
                        + "'modifiedOn':'2017-11-07 17:12:05'"
                        + "}"
                    + "]"
              + "},"
        + "{'cdoId':'OID04',"
        + "'id':2,"
        + "'categoryName':'CAT2',"
        + "'categories':"
                + "["
                      + "{'cdoId':'OID05',"
                      + "'id':3,"
                      + "'categoryName':'CAT3',"
                      + "'categories':[],"
                            + "'requirements':["
                                  + "{"
                                  + "'cdoId':'OID06',"
                                  + "'id':1,"
                                  + "'name':'RQ4',"
                                  + "'version':'1',"
                                  + "'statement':'',"
                                  + "'rationale':'RAT4',"
                                  + "'acceptanceCriteria':'',"
                                  + "'type':'technical',"
                                  + "'subType':'',"
                                  + "'status':'OK',"
                                  + "'createdOn':'2017-11-07 17:10:42',"
                                  + "'modifiedOn':'2017-11-07 17:12:21'"
                                  + "}"
                            + "]"
                      + "}"
                + "],"
        + "'requirements':"
            + "["
                  + "{"
                  + "'cdoId':'OID07',"
                  + "'id':2,"
                  + "'name':'RQ3',"
                  + "'version':'1',"
                  + "'statement':'',"
                  + "'rationale':'RAT3',"
                  + "'acceptanceCriteria':'',"
                  + "'type':'functional',"
                  + "'subType':'',"
                  + "'status':'OK',"
                  + "'createdOn':'2017-11-07 17:10:31',"
                  + "'modifiedOn':'2017-11-07 17:10:36'"
                  + "}"
            + "]"
        + "},"
        + "{'cdoId':'OID08',"
        + "'id':4,"
        + "'categoryName':'CAT4',"
        + "'categories':[],"
        + "'requirements':"
            + "["
                + "{"
                + "'cdoId':'OID09',"         
                + "'id':1,"
                + "'name':'RQ4',"
                + "'version':'1',"
                + "'statement':'',"
                + "'rationale':'RAT4',"
                + "'acceptanceCriteria':'',"
                + "'type':'technical',"
                + "'subType':'',"
                + "'status':'KO',"
                + "'createdOn':'2017-11-07 17:10:42',"
                + "'modifiedOn':'2017-11-07 17:12:21'"
                + "}"
            + "]"
        + "}"
        + "]"
  + "}"
  + "}";
}
