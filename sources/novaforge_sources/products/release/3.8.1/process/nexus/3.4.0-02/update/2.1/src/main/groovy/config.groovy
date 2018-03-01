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

// NB: "dataFile", "processTmpPath" and "engine" are variables set by Beaver

import org.novaforge.beaver.deployment.plugin.deploy.engine.BeaverEngine
import org.novaforge.beaver.deployment.plugin.deploy.engine.SystemdService
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

BeaverEngine beaverEngine = engine

// Server variables
def localUser = beaverEngine.getResource("local:user")
def localGroup = beaverEngine.getResource("local:group")

// Nexus variables
def nexusHome = beaverEngine.getResource("home")
def nexusLogs = beaverEngine.getResource("logs")
def nexusDatas = beaverEngine.getResource("datas")
def nexusTmp = beaverEngine.getResource("tmp")
def clientPort = beaverEngine.getResource("main", "novaforge-connector-nexus", "clientPort")
def defaultAlias = beaverEngine.getResource("main", "novaforge-connector-nexus", "defaultAlias")
def toolAlias = beaverEngine.getResource("main", "novaforge-connector-nexus", "toolAlias")
def hostname = beaverEngine.getResource("local:host")

// Global configuration (nexus-default.properties file)
def nexusProperties = nexusHome + "/etc/nexus-default.properties"
beaverEngine.copyToFile(processTmpPath + "/resources/etc/nexus-default.properties", nexusProperties)
beaverEngine.replaceElement(nexusProperties, "@NEXUS_PORT@", clientPort)
beaverEngine.replaceElement(nexusProperties, "@DEFAULT_ALIAS@", defaultAlias)
beaverEngine.replaceElement(nexusProperties, "@TOOL_ALIAS@", toolAlias)
beaverEngine.replaceElement(nexusProperties, "@NEXUS_DATA@", nexusDatas)

// Cas configuration (custom.properties file)
def casProperties = nexusDatas + "/etc/cas.properties"
beaverEngine.copyToFile(processTmpPath + "/resources/etc/cas.properties", casProperties)
beaverEngine.replaceElement(casProperties, "@HOSTNAME@", hostname)


def jreHome = beaverEngine.getResource("jre8","home")

// Execute configuration (bin/nexus file)
def nexusBin = beaverEngine.getResource("bin")
beaverEngine.copyToFile(processTmpPath + "/resources/bin/nexus", nexusBin)
beaverEngine.replaceElement(nexusBin, "@NEXUS_HOME@", nexusHome)
beaverEngine.replaceElement(nexusBin, "@NEXUS_DATAS@", nexusDatas)
beaverEngine.replaceElement(nexusBin, "@NEXUS_TMP@", nexusTmp)
beaverEngine.replaceElement(nexusBin, "@NEXUS_BIN@", nexusBin)
beaverEngine.replaceElement(nexusBin, "@JAVA_HOME@", jreHome)
beaverEngine.replaceElement(nexusBin, "@NOVAFORGE_USER@",localUser)

// Execute configuration (engines/nexus/bin/nexus file)
def engineNexusBin = nexusHome + "/bin/nexus"
beaverEngine.copyToFile(processTmpPath + "/resources/bin/engineNexusBin", engineNexusBin)
beaverEngine.replaceElement(engineNexusBin, "@JAVA_HOME@", jreHome)

// JVM options configuration (nexus.vmoptions file)
def nexusVMOptions = nexusHome + "/bin/nexus.vmoptions"
beaverEngine.copyToFile(processTmpPath + "/resources/bin/nexus.vmoptions", nexusVMOptions)
beaverEngine.replaceElement(nexusVMOptions, "@NEXUS_DATAS@", nexusDatas)
beaverEngine.replaceElement(nexusVMOptions, "@NEXUS_HOME@", nexusHome)
beaverEngine.replaceElement(nexusVMOptions, "@NEXUS_LOG@", nexusLogs)

//  JKS configuration (jetty-htpps.xml file)
def jksPwd = beaverEngine.getResource("certificat", "jksPwd")
def jks = beaverEngine.getResource("certificat", "jks")
def jettyHttps = nexusHome  + "/etc/jetty/jetty-https.xml"
beaverEngine.copyToFile(processTmpPath + "/resources/etc/jetty/jetty-https.xml", jettyHttps)
beaverEngine.replaceElement(jettyHttps,"@JKS_PATH@",jks)
beaverEngine.replaceElement(jettyHttps,"@JKS_PWD@",jksPwd)

// LOG configuration (logback.xml file)
def nexusLogback = nexusHome + "/etc/logback/logback.xml"
beaverEngine.copyToFile(processTmpPath + "/resources/etc/logback/logback.xml", nexusLogback)
beaverEngine.replaceElement(nexusLogback, "@NEXUS_LOG@", nexusLogs)

// LOG ACCESS configuration (logback-access.xml file)
def nexusLogAccess = nexusHome + "/etc/logback/logback-access.xml"
beaverEngine.copyToFile(processTmpPath + "/resources/etc/logback/logback-access.xml", nexusLogAccess)
beaverEngine.replaceElement(nexusLogAccess, "@NEXUS_LOG@", nexusLogs)

// Define rights / owner
def nexusBinOOB= nexusHome+ "/bin/nexus"
// add truststore configuration in nexus bin
beaverEngine.replaceElement(nexusBinOOB, "@JKS_PATH@", jks) 
beaverEngine.replaceElement(nexusBinOOB, "@JKS_PWD@", jksPwd) 
beaverEngine.setPermissionsOnDirectories(true,"755",nexusHome + "/bin")
beaverEngine.setPermissionsOnFiles(false, "755", nexusBinOOB)
beaverEngine.setPermissionsOnFiles(false, "755", nexusBin)
beaverEngine.setOwner(false, localGroup, localUser, nexusBin)
beaverEngine.setOwner(true,localGroup,localUser,nexusHome)
beaverEngine.setOwner(true,localGroup,localUser,nexusDatas)
beaverEngine.setOwner(true,localGroup,localUser,nexusLogs)
beaverEngine.setOwner(true,localGroup,localUser,nexusTmp)

 