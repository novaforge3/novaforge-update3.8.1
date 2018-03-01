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
package org.novaforge.forge.tools.requirements.common.connectors.ws.models;

import java.util.List;


/**
 * @author a111122
 *
 */
public class Category
{
  
  private String cdoId;
  private String id;
  private String categoryName;
  private List<Category> categories;
  private List<Requirement> requirements;
  
  
  
  public Category (String cdoId, String categoryId, String categoryName,List<Category> categories, List<Requirement> requirements ){
    super();
    this.cdoId = cdoId;
    this.id = categoryId;
    this.categoryName = categoryName;
    this.categories = categories;
    this.requirements = requirements;
  }
  
  public static class Requirement {
    
    private String cdoId;
    private String id;
    private String name;
    private String version;
    private String statement;
    private String rationale;
    private String acceptanceCriteria;
    private String type;
    private String subType;
    private String status;
    private String createdOn;
    private String modifiedOn;
    
    public Requirement(String cdoId, String requirementId, String name, String version, String statement, String rationale,
        String acceptanceCriteria, String type, String subType, String status,String createdOn, String modifiedOn ) {
      super();
      this.setCdoId(cdoId);
      this.setRequirementId(requirementId);
      this.setName(name);
      this.setVersion(version);
      this.setStatement(statement);
      this.setRationale(rationale);
      this.setAcceptanceCriteria(acceptanceCriteria);
      this.setType(type);
      this.setSubType(subType);
      this.setStatus(status);
      this.setCreatedOn(createdOn);
      this.setModifiedOn(modifiedOn);
    }

    /**
     * @return the requirementId
     */
    public String getRequirementId()
    {
      return id;
    }

    /**
     * @param requirementId 
     *		the requirementId to set
     */
    public void setRequirementId(String requirementId)
    {
      this.id = requirementId;
    }

    /**
     * @return the name
     */
    public String getName()
    {
      return name;
    }

    /**
     * @param name 
     *		the name to set
     */
    public void setName(String name)
    {
      this.name = name;
    }

    /**
     * @return the version
     */
    public String getVersion()
    {
      return version;
    }

    /**
     * @param version 
     *		the version to set
     */
    public void setVersion(String version)
    {
      this.version = version;
    }

    /**
     * @return the statement
     */
    public String getStatement()
    {
      return statement;
    }

    /**
     * @param statement 
     *		the statement to set
     */
    public void setStatement(String statement)
    {
      this.statement = statement;
    }

    /**
     * @return the rationale
     */
    public String getRationale()
    {
      return rationale;
    }

    /**
     * @param rationale 
     *		the rationale to set
     */
    public void setRationale(String rationale)
    {
      this.rationale = rationale;
    }

    /**
     * @return the acceptanceCriteria
     */
    public String getAcceptanceCriteria()
    {
      return acceptanceCriteria;
    }

    /**
     * @param acceptanceCriteria 
     *		the acceptanceCriteria to set
     */
    public void setAcceptanceCriteria(String acceptanceCriteria)
    {
      this.acceptanceCriteria = acceptanceCriteria;
    }

    /**
     * @return the type
     */
    public String getType()
    {
      return type;
    }

    /**
     * @param type 
     *		the type to set
     */
    public void setType(String type)
    {
      this.type = type;
    }

    /**
     * @return the subType
     */
    public String getSubType()
    {
      return subType;
    }

    /**
     * @param subType 
     *		the subType to set
     */
    public void setSubType(String subType)
    {
      this.subType = subType;
    }

    /**
     * @return the status
     */
    public String getStatus()
    {
      return status;
    }

    /**
     * @param status 
     *		the status to set
     */
    public void setStatus(String status)
    {
      this.status = status;
    }

    /**
     * @return the createdOn
     */
    public String getCreatedOn()
    {
      return createdOn;
    }

    /**
     * @param createdOn 
     *		the createdOn to set
     */
    public void setCreatedOn(String createdOn)
    {
      this.createdOn = createdOn;
    }

    /**
     * @return the modifiedOn
     */
    public String getModifiedOn()
    {
      return modifiedOn;
    }

    /**
     * @param modifiedOn 
     *		the modifiedOn to set
     */
    public void setModifiedOn(String modifiedOn)
    {
      this.modifiedOn = modifiedOn;
    }

    /**
     * @return the cdoId
     */
    public String getCdoId()
    {
      return cdoId;
    }

    /**
     * @param cdoId 
     *		the cdoId to set
     */
    public void setCdoId(String cdoId)
    {
      this.cdoId = cdoId;
    }
  }

  /**
   * @return the categoryId
   */
  public String getCategoryId()
  {
    return id;
  }

  /**
   * @param categoryId 
   *		the categoryId to set
   */
  public void setCategoryId(String categoryId)
  {
    this.id = categoryId;
  }

  /**
   * @return the name
   */
  public String getCategoryName()
  {
    return categoryName;
  }

  /**
   * @param name 
   *		the name to set
   */
  public void setCategoryName(String categoryName)
  {
    this.categoryName = categoryName;
  }

  /**
   * @return the category
   */
  public List<Category> getCategories()
  {
    return categories;
  }

  /**
   * @param category 
   *		the category to set
   */
  public void setCategories(List<Category> categories)
  {
    this.categories = categories;
  }

  /**
   * @return the requirements
   */
  public List<Requirement> getRequirements()
  {
    return requirements;
  }

  /**
   * @param requirements 
   *		the requirements to set
   */
  public void setRequirements(List<Requirement> requirements)
  {
    this.requirements = requirements;
  }

  /**
   * @return the cdoId
   */
  public String getCdoId()
  {
    return cdoId;
  }

  /**
   * @param cdoId 
   *		the cdoId to set
   */
  public void setCdoId(String cdoId)
  {
    this.cdoId = cdoId;
  }

}
