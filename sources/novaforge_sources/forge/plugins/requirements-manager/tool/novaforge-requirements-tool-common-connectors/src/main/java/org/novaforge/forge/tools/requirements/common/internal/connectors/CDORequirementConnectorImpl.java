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
package org.novaforge.forge.tools.requirements.common.internal.connectors;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.novaforge.forge.commons.technical.historization.annotations.HistorizableParam;
import org.novaforge.forge.commons.technical.historization.annotations.Historization;
import org.novaforge.forge.commons.technical.historization.model.EventLevel;
import org.novaforge.forge.commons.technical.historization.model.EventType;
import org.novaforge.forge.commons.technical.historization.services.HistorizationService;
import org.novaforge.forge.tools.requirements.common.connectors.ExternalRepositoryRequirementConnector;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoRestClient;
import org.novaforge.forge.tools.requirements.common.connectors.ws.CdoRestException;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Category;
import org.novaforge.forge.tools.requirements.common.connectors.ws.models.Category.Requirement;
import org.novaforge.forge.tools.requirements.common.exceptions.RequirementConnectorException;
import org.novaforge.forge.tools.requirements.common.exceptions.RequirementFactoryException;
import org.novaforge.forge.tools.requirements.common.exceptions.RequirementManagerServiceException;
import org.novaforge.forge.tools.requirements.common.factories.RequirementFactory;
import org.novaforge.forge.tools.requirements.common.internal.connectors.ws.CdoRestClientImpl;
import org.novaforge.forge.tools.requirements.common.model.EDirectoryLevel;
import org.novaforge.forge.tools.requirements.common.model.ERepositoryType;
import org.novaforge.forge.tools.requirements.common.model.ERequirementType;
import org.novaforge.forge.tools.requirements.common.model.IDirectory;
import org.novaforge.forge.tools.requirements.common.model.IRepository;
import org.novaforge.forge.tools.requirements.common.model.IRequirement;
import org.novaforge.forge.tools.requirements.common.model.IRequirementVersion;
import org.novaforge.forge.tools.requirements.common.services.RequirementManagerService;
import org.novaforge.forge.tools.requirements.common.services.RequirementRepositoryService;

/**
 * @author sbenoist
 */
public class CDORequirementConnectorImpl extends AbstractRequirementConnector implements
    ExternalRepositoryRequirementConnector
{
  private static final Log               LOGGER = LogFactory.getLog(CDORequirementConnectorImpl.class);

  private static String                  repository;

  private static String                  host;

  private static String                  port;
  private static String                  clientAdmin;
  private static String                  clientPwd;
  private static String                  wsRequirementsPath;
  private RequirementFactory             requirementFactory;
  private RequirementManagerService      requirementManagerService;
  private RequirementRepositoryService   requirementRepositoryService;
  private HistorizationService           historizationService;
  
  

  public CDORequirementConnectorImpl()
  {
    super();
  }

  /**
   * This method allows to update properties for directories and requirements on CDO referential, to move and
   * to delete directories and requirements moved and deleted on CDO referential {@inheritDoc}
   *
   * @param pRepository
   * @param pProjectId
   */
  private void synchronizeRepo(final IRepository pRepository, final String pProjectId)
      throws RequirementConnectorException
  {
    // check mandatory parameters
    if ((repository == null) || (repository.trim().length() == 0) || (host == null)
        || (host.trim().length() == 0) || (port == null) || (port.trim().length() == 0))
    {
      throw new RequirementConnectorException(
          "one of the mandatory parameters like repository, host or port is not set to connect in TCP to CDO Repository");
    }
    // check Obeo respository URI
    if (pRepository.getCdoProjectName() == null && pRepository.getCdoRelativeUrl() == null) {
      throw new RequirementConnectorException(
          String.format("Obeo respository URI is not set correctly %s. Cdo Project Name=%s, Cdo Relative URL=%s",pRepository.getURI(),pRepository.getCdoProjectName(), pRepository.getCdoRelativeUrl()));
    }
    try
    {  
         final List<Category> categories = getAllcategories (repository, pRepository);

          // Get all the forge directories from the repository uri to merge them with those from CDO server
          final Set<IDirectory> dirsToMerge = requirementManagerService
              .loadAllRootDirectoryTreesByRepository(pRepository);
    
          // Get the Root directory linked to the forge project
          final String reference = buildForgeReference(pProjectId, pRepository.getCdoProjectName());
          final IDirectory dirToMerge = getDirectoryByReference(dirsToMerge, reference);
          if (dirToMerge != null)
          {
            // build Root directory to forge model
            toRootDirectory(dirToMerge, pRepository, pProjectId, reference, categories);
            // remove the elements removed from CDO
            removedUnreferencedElements( dirToMerge, pRepository, categories);
            // update the Root directory
            requirementManagerService.updateDirectory(dirToMerge);
          }
          // create new Root directory
          else
          {
            final IDirectory dirToSave = requirementFactory.buildNewDirectory(EDirectoryLevel.ROOT);
            toRootDirectory(dirToSave,  pRepository, pProjectId, reference, categories);
            // store the root directory
            requirementManagerService.createDirectory(dirToSave);
          }
          // remove the Root directory removed from CDO
          removeUnreferencedRootDirs(pRepository, dirsToMerge);     
    }
    catch (final RequirementManagerServiceException e)
    {
      throw new RequirementConnectorException(String.format(
          "unable to update root directories from repository with uri=%s", pRepository.getURI()), e);
    }
    catch (final RequirementFactoryException e)
    {
      throw new RequirementConnectorException(
          String.format(
              "unable to build new instances for directory, requirement and requirementVersion for repository with uri=%s",
              pRepository.getURI()), e);
    }
    catch (final Exception e)
    {
      throw new RequirementConnectorException(String.format(
          "unable to synchronize for repository with uri=%s on CDO repository", pRepository.getURI()), e);
    }
    finally
    {
      // Do nothing
    }
  }

  
  private void removeUnreferencedRootDirs(final IRepository pSourceDir,
      final Set<IDirectory> pTargetDirs) throws RequirementConnectorException
  {
    for (final IDirectory dir : pTargetDirs)
    {
      if (!buildCDOReference(dir.getReference()).contains(pSourceDir.getCdoProjectName()))
       
      {
        try
        {
              LOGGER.info("Delete root directory with reference = " + dir.getReference());
              requirementManagerService.deleteRootDirectoryTree(dir);
        }
        catch (final RequirementManagerServiceException e)
        {
          throw new RequirementConnectorException(String.format(
              "unable to delete root directory with reference=%s", dir.getReference()), e);
        }
      }
    }
  }
  
 
  private IDirectory getDirectoryByReference(final Set<IDirectory> directories, final String pReference)
  {
    IDirectory returned = null;
    for (final IDirectory directory : directories)
    {
      if (directory.getReference().equals(pReference))
      {
        returned = directory;
        break;
      }
    }
    
    return returned;
  }

  /**
   * The rootDirectory is equal to the repository object in CDO Model. 
   * All the subdirectories are equals to maincategories and subcategories
   *
   * @param IDirectory
   * @param pForgeRepository
   * @param pProjectId
   * @param pRepositoryURI
   * @throws RequirementFactoryException
   * @throws RequirementManagerServiceException
   */
  private void toRootDirectory(final IDirectory pRootDirectory, 
      final IRepository pForgeRepository, final String pProjectId, final String pReference, List<Category> pCategories)
      throws RequirementFactoryException, RequirementManagerServiceException
  {
    pRootDirectory.setName(pForgeRepository.getCdoProjectName());
    pRootDirectory.setRepository(pForgeRepository);
    pRootDirectory.setReference(pReference);
         
    // Get the maindirectories
    for (final Category category : pCategories)
    {
      if (category.getCategoryId() != null)
      {
        final String reference = buildForgeReference(pProjectId, category.getCdoId());
        
        final IDirectory mainDirectory = findOrCreateDirectory(pRootDirectory, pRootDirectory, reference);
        mainDirectory.setName(category.getCategoryId());
        mainDirectory.setDescription(category.getCategoryName());
        mainDirectory.setReference(reference);
        // Get all the subdirectories
        addChildren(pRootDirectory, mainDirectory, category, pProjectId);
      }
    }  
  }

  /**
   * This method allows to add the children of a directory (ie subdirectories and requirements )
   *
   * @param pParentDirectory
   * @param pCategory
   * @param pProjectId
   * @throws RequirementFactoryException
   * @throws RequirementManagerServiceException
   */
  
  private void addChildren(final IDirectory pRootDirectory, final IDirectory pParentDirectory,
      final Category pCategory, final String pProjectId) throws RequirementFactoryException,
      RequirementManagerServiceException
  {
    final List<Category> subcategories = pCategory.getCategories();
    for (final Category subcategory : subcategories)
    {
      if (subcategory.getCategoryId() != null)
      {
        final String reference = buildForgeReference(pProjectId, subcategory.getCdoId());

        final IDirectory directory = findOrCreateDirectory(pRootDirectory, pParentDirectory, reference);
        directory.setName(subcategory.getCategoryId());
        directory.setDescription(subcategory.getCategoryName());
        directory.setReference(reference);
        addChildren(pRootDirectory, directory, subcategory, pProjectId);
      }
    }
    addRequirements(pRootDirectory, pParentDirectory, pCategory, pProjectId);
  }

  private IDirectory findOrCreateDirectory(final IDirectory pRootDirectory,
      final IDirectory pParentDirectory, final String pReference) throws RequirementFactoryException,
      RequirementManagerServiceException
  {
    // check first if the subdirectory exists in its parent directory
    IDirectory directory = pParentDirectory.findDirectoryByReference(pReference);
    if (directory == null)
    {
      // check if the directory reference exists anywhere else and move it
      directory = findDeepDirectoryByReference(pRootDirectory, pReference);
      if (directory != null)
      {
        directory.setParent(pParentDirectory);
      }
      else
      {
        directory = requirementFactory.buildNewDirectory(EDirectoryLevel.LEAF);
        pParentDirectory.addDirectory(directory);
      }
    }
    
    return directory;
  }

  private IRequirement findOrCreateRequirement(final IDirectory pRootDirectory, final IDirectory pDirectory,
      final String pReference, final String pProjectId) throws RequirementManagerServiceException,
      RequirementFactoryException
  {
    // check first if the requirement exists in its parent directory
    IRequirement requirement = pDirectory.findRequirementByReference(pReference);
    if (requirement == null)
    {
      // check if the requirement reference exists anywhere else and move it
      requirement = findDeepRequirementByReference(pRootDirectory, pReference);
      if (requirement != null)
      {
        requirement.setDirectory(pDirectory);
      }
      else
      {
        // create new reference
        requirement = requirementFactory.buildNewRequirement();
        requirement.setProjectId(pProjectId);
        pDirectory.addRequirement(requirement);
      }
    }
    
    return requirement;
  }

  // look for the requirement in the full tree recursively
  private IRequirement findDeepRequirementByReference(final IDirectory pDirectory, final String pReference)
  {
    IRequirement returned = pDirectory.findRequirementByReference(pReference);

    if (returned == null)
    {
      final Set<IDirectory> directories = pDirectory.getChildrenDirectories();
      for (final Iterator<IDirectory> it = directories.iterator(); it.hasNext() && (returned == null);)
      {
        returned = findDeepRequirementByReference(it.next(), pReference);
      }
    }
    
    return returned;
  }

  // look for the requirement in the full tree recursively
  private IDirectory findDeepDirectoryByReference(final IDirectory pDirectory, final String pReference)
  {
    IDirectory returned = pDirectory.findDirectoryByReference(pReference);

    if (returned == null)
    {
      final Set<IDirectory> directories = pDirectory.getChildrenDirectories();
      for (final Iterator<IDirectory> it = directories.iterator(); it.hasNext() && (returned == null);)
      {
        returned = findDeepDirectoryByReference(it.next(), pReference);
      }
    }
    
    return returned;
  }

  private IRequirementVersion findOrCreateRequirementVersion(final IRequirement pRequirement,
      final int pVersion) throws RequirementManagerServiceException, RequirementFactoryException
  {
    // load the versions if it already exists
    IRequirementVersion requirementVersion = pRequirement.findRequirementVersion(pVersion);

    if (requirementVersion == null)
    {
      requirementVersion = requirementFactory.buildNewRequirementVersion();
      requirementVersion.setCurrentVersion(pVersion);
      pRequirement.addRequirementVersion(requirementVersion);
    }
    
    return requirementVersion;
  }

  private String buildForgeReference(final String pProjectId, final String pExternalKey)
  {
    // The reference contains projectId to allow multiple projects to refer to the same requirement
    return pProjectId + ":" + pExternalKey;
  }

  /**
   * This method allows to get the requirements of a directory
   *
   * @param pDirectory
   * @param pCategory
   * @param pProjectId
   * @throws RequirementFactoryException
   * @throws RequirementManagerServiceException
   */
  
  private void addRequirements(final IDirectory pRootDirectory, final IDirectory pDirectory,
      final Category pCategory, final String pProjectId) throws RequirementFactoryException,
      RequirementManagerServiceException
  {
    final List<Requirement> requirements = pCategory.getRequirements();
    for (final Requirement sourceRequirement : requirements)
    {
      final String reference = buildForgeReference(pProjectId, sourceRequirement.getCdoId());

      final IRequirement requirement = findOrCreateRequirement(pRootDirectory, pDirectory, reference,
          pProjectId);
      requirement.setAcceptanceCriteria(sourceRequirement.getAcceptanceCriteria());
      requirement.setName(sourceRequirement.getRequirementId());
      requirement.setDescription(sourceRequirement.getName());
      requirement.setRationale(sourceRequirement.getRationale());
      requirement.setSubType(sourceRequirement.getSubType());
      requirement.setStatus(sourceRequirement.getStatus());
      requirement.setReference(reference);

      if (ERequirementType.functional.getLabel().equals(sourceRequirement.getType()))
      {
        requirement.setType(ERequirementType.FONCTIONAL.getLabel());
      }
      else if (ERequirementType.technical.getLabel().equals(sourceRequirement.getType()))
      {
        requirement.setType(ERequirementType.TECHNICAL.getLabel());
      }
      else
      {
        requirement.setType(ERequirementType.UNDEFINED.getLabel());
      }
      int version = -1;
      try {
        version = Integer.parseInt(sourceRequirement.getVersion());
      } catch (NumberFormatException e ){
        version = 1;
      }
      // add the version
      final IRequirementVersion reqVersion = findOrCreateRequirementVersion(requirement,version);
      reqVersion.setStatement(sourceRequirement.getStatement());

      // Get the Graal referenced objects (not implemented in this version
      // EList<EObject> referencedObjects = sourceRequirement.getReferencedObject();
      //
      // for (EObject object : referencedObjects) { System.out.println(object.getClass().getName()); }
       //
    }
  }

  /**
   * This is to remove the elements which are no more present next to the synchro
   *
   * @param pRootDirectory
   * @param pRepository
   * @throws RequirementManagerServiceException
   */
  private void removedUnreferencedElements(final IDirectory pRootDirectory, final IRepository pForgeRepository, final List<Category> pCategories)
      throws RequirementManagerServiceException 
  {
    // we get all the references of each directory and requirement of the CDO tree
    final Set<String> refs = toRefs(pForgeRepository, pCategories);

    // we loop on the rootDirectory and look if each directory and each requirement has a reference in the
    // refs set
    final LinkedList<IDirectory> unrefsDirectories = new LinkedList<IDirectory>();
    final Set<IRequirement> unrefsRequirements = new HashSet<IRequirement>();
    getUnrefs(pRootDirectory, refs, unrefsDirectories, unrefsRequirements);

    // delete first all requirements
    for (final IRequirement requirement : unrefsRequirements)
    {
      final IDirectory parent = requirement.getDirectory();  
      parent.deleteRequirement(requirement);
      LOGGER.info("delete requirement = " + requirement.getName());
      requirementManagerService.updateDirectory(parent);
    }

    // delete directories for children to parents    
    for (final Iterator<IDirectory> it = unrefsDirectories.descendingIterator(); it.hasNext();)
    {
      final IDirectory directory = it.next();
      final IDirectory parent = directory.getParent();
      parent.deleteDirectory(directory);
      LOGGER.info("delete directory = " + directory.getName());
      requirementManagerService.updateDirectory(parent);
    }
  }

  private String buildCDOReference(final String pReference)
  {
    return pReference.split(":")[1];
  }

  
  private void getUnrefs(final IDirectory pDirectory, final Set<String> pRefs,
      final List<IDirectory> pUnrefDirectories, final Set<IRequirement> pUnrefRequirements)
  {
    final Set<IRequirement> requirements = pDirectory.getRequirements();
    for (final IRequirement requirement : requirements)
    {
      if (!pRefs.contains(buildCDOReference(requirement.getReference())))
      {
        pUnrefRequirements.add(requirement);
      }
    }

    final Set<IDirectory> directories = pDirectory.getChildrenDirectories();
    for (final IDirectory directory : directories)
    {
      if (!pRefs.contains(buildCDOReference(directory.getReference())))
      {
        pUnrefDirectories.add(directory);
      }
      
      getUnrefs(directory, pRefs, pUnrefDirectories, pUnrefRequirements);
    }
  }

  private Set<String> toRefs(final IRepository pForgeRepository, List<Category> pCategories) 
  {
    final Set<String> refs = new TreeSet<String>();
    
    for (final Category categorie : pCategories)
    {
      flatTheTree(categorie, refs);
    }
    
    return refs;
  }

  private void flatTheTree(final Category pCategory, final Set<String> pSet)
  {
    
    pSet.add(pCategory.getCdoId());

    final List<Category> subcategories = pCategory.getCategories();
    for (final Category subcategory : subcategories)
    {
      flatTheTree(subcategory, pSet);
    }

    final List<Requirement> requirements = pCategory.getRequirements();
    for (final Requirement requirement : requirements)
    {
      pSet.add(requirement.getCdoId());
    }
  }


  @Override
  public String getRepositoryLocation()
  {
    return "cdo://" + host + ":" + port + "/" + repository;
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public boolean validate(final IRepository pRepository)
  {
    final boolean result = true;
    if ((pRepository != null) && ERepositoryType.OBEO.equals(pRepository.getType()))
    {
      // TODO: Validate the repository
    }
    return result;
  }

  @Override
  @Historization(type = EventType.SYNCHRONIZATION_EXTERNAL_REQUIREMENTS)
  public void synchronize(@HistorizableParam(label = "ProjectId") final String pProjectID, String pCurrentUser)
      throws RequirementConnectorException
  {
    Map<String, Object> maps = new HashMap<>();
    maps.put("ProjectId", pProjectID);
    historizationService.registerEvent(pCurrentUser, EventType.SYNCHRONIZATION_EXTERNAL_REQUIREMENTS, EventLevel.ENTRY, maps);
    try
    {
      if (LOGGER.isDebugEnabled())
      {
        LOGGER.debug(String.format("CDO synchronization for project=%s", pProjectID));
      }

      final Set<IRepository> repositories = requirementRepositoryService.findRepositoriesByType(pProjectID,
          ERepositoryType.OBEO);
      for (final IRepository repository : repositories)
      {
        if (LOGGER.isDebugEnabled())
        {
          LOGGER.debug(String.format("CDO synchronization for repository=%s", repository.getURI()));
        }
        synchronizeRepo(repository, pProjectID);
      }

    }
    catch (final RequirementManagerServiceException e)
    {
      throw new RequirementConnectorException(String.format("unable to get project with projectID=%s",
          pProjectID), e);
    }
    historizationService.registerEvent(pCurrentUser, EventType.SYNCHRONIZATION_EXTERNAL_REQUIREMENTS, EventLevel.EXIT, new HashMap<String, Object>());
  }

  @Override
  protected EventType getEventType()
  {
    return EventType.SYNCHRONIZATION_EXTERNAL_REQUIREMENTS;
  }

  @Override
  protected HistorizationService getHistorizationService()
  {
    return historizationService;
  }

  public void setHistorizationService(final HistorizationService historizationService)
  {
    this.historizationService = historizationService;
  }


  public void setRepository(final String pRepository)
  {
    repository = pRepository;
    LOGGER.info(String.format("new value for repository is : %s", pRepository));
  }

  public void setHost(final String pHost)
  {
    host = pHost;
    LOGGER.info(String.format("new value for host is : %s", pHost));
  }

  public void setPort(final String pPort)
  {
    port = pPort;
    LOGGER.info(String.format("new value for port is : %s", pPort));
  }

  public void setRequirementFactory(final RequirementFactory pRequirementFactory)
  {
    requirementFactory = pRequirementFactory;
  }

  public void setRequirementManagerService(final RequirementManagerService pRequirementManagerService)
  {
    requirementManagerService = pRequirementManagerService;
  }
  
  
  public void setClientAdmin(String pClientAdmin)
  {
    clientAdmin = pClientAdmin;
  }

  public static void setClientPwd(String pClientPwd)
  {
    clientPwd = pClientPwd;
  }
  
  public static void setWsRequirementsPath(String pWsRequirementsPath)
  {
    wsRequirementsPath = pWsRequirementsPath;
  }
  
  /**
   * Get CDO Rest client setting Http client connector
   *
   * @param pCdoRepository
   * @param pIRepository
   * @return CdoRestClient
   * @throws RequirementConnectorException
   */
   
  private CdoRestClient getCdoRestClient() throws RequirementConnectorException {
    
    CdoRestClient cdoRestClient = null;
    
    if ((host == null) || (port == null))
    {
      throw new IllegalArgumentException("Unable to get CDO connector because host and port can't be null");
    }
    try
    {
      cdoRestClient = CdoRestClientImpl.getInstance();
      cdoRestClient.setConnector(host, port, clientAdmin, clientPwd);
      return cdoRestClient;
      
    } 
    catch (CdoRestException e) 
    {
      throw new RequirementConnectorException("An error occured during getting a CDO Rest client connector", e);
    }
  }
  
  /**
   * Get all Requirements from cdo server linked to
   * CDO Respositiory, CDO ProjectName and CDO relative URL
   *
   * @param pCdoRepository
   * @param pIRepository
   * @return List<Category> : Requirements list
   * @throws RequirementConnectorException
   */
  
  private List<Category> getAllcategories (final String pCdoRepository,  final IRepository pIRepository) throws RequirementConnectorException{
    
    List<Category> categories = new ArrayList<Category>();
        
    try {
      CdoRestClient cdoRestClient = getCdoRestClient();
      categories = cdoRestClient.getAllCategories(wsRequirementsPath, pCdoRepository, pIRepository.getCdoProjectName(), pIRepository.getCdoRelativeUrl());
      return categories;
      
    } 
    catch (CdoRestException e) 
    {
      throw new RequirementConnectorException("an error occured during getting cdo categories", e);
    }
  }

}
