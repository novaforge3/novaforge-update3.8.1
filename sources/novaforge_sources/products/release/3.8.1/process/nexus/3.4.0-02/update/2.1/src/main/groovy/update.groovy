/**
 * Copyright (c) 2011-2015, BULL SAS, NovaForge Version 3 and above.
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
import org.novaforge.beaver.deployment.plugin.deploy.engine.BeaverEngine;
import org.novaforge.beaver.deployment.plugin.deploy.engine.SystemdService
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import org.codehaus.plexus.util.StringUtils

BeaverEngine beaverEngine = engine

// Extract nexus
def nexusHome = beaverEngine.getResource("home")
Path nexusHomePath = Paths.get(nexusHome)

// - nexus service
def nexusSystemd = beaverEngine.getResource("systemdService")
SystemdService systemdService = beaverEngine.getSystemdService()
def nexusService = beaverEngine.getResource("nexus", "systemdService")
def localGroup = beaverEngine.getResource("local:group")
def localUser = beaverEngine.getResource("local:user")
def productLog = beaverEngine.getResource("product.logs")
def nexusLogFile = productLog + "/wrapper.log"

/******************************************************************************************************************
* install new version
******************************************************************************************************************/
def nexusDistrib=  "nexus-distrib-3.4.0-02_1" 

beaverEngine.unpackFile(dataFile, processTmpPath)

//remove previous version
if (Files.exists(nexusHomePath))
{
  beaverEngine.delete(nexusHome)  
}
beaverEngine.createDirectory(nexusHome)
beaverEngine.moveDir(processTmpPath + "/" + nexusDistrib + "/nexus-3.4.0-02/", nexusHome)
