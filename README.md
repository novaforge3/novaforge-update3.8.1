# NovaForge
> NovaForge is an integrated collaborative development platform, covering all the life-cycle of Enterprise software development, from requirement definition to support and maintenance.

## Table of Contents

- [Introduction](#introduction)
- [Building](#building)
- [Installation](#installation)
- [Usage](#usage)
- [Licensing](#licensing)

## Introduction

NovaForge 3.8.1 update 

This update fixes the following tools :

| Category                                | Products           |
| --------------------------------------- | ------------------ |
| Repository Management                   | Nexus              |

This update fixes only the release 3.8.0 of NovaForge.

## Building

### Introduction
To be able to deploy this update you must have first the 3.8.0 sources deployed see novaforge 3.8.0 installation guide.

The following procedure describes how to get a package able to update a release 3.8.0 of NovaForge.

### Set your environment
All following commands will have to be run with the `config` account. 

### Get the project
To retrieve all the components, perform the following "git clone" commands :
```sh
cd /datas
git clone https://github.com/novaforge3/novaforge-update3.8.1.git
```
If you're facing errors like "Failed connect to github.com:443; Connection timed out", it usually means you're accessing Internet through a web proxy.

In that case, set the `https_proxy` environment variable this way :
```sh
export https_proxy=https://<proxy-IP>:<proxy-port>/
```

Once all downloads are completed, you should have a folder tree like this one :
```sh
/datas/novaforge-update3.8.1
```

### Prepare the environment
First, move the NovaForge main folders to their final location :
```sh
cd sources
mv novaforge_sources novaforge_sources_3.8.0
cp -r /datas/novaforge-update3.8.1/sources/novaforge_sources 
```

### Initialize other needed files and folders
```sh
mkdir /datas/sources/novaforge_sources/forge/docs/requirements-guide/src/main/resources/docbkx/images
cp /datas/sources/novaforge_sources_3.8.0/products/release/3.8.0/data/nexus/3.4.0-02/0/nexus-distrib/src/main/resources/nexus-3.4.0-02-unix.tar.gz /datas/sources/novaforge_sources/products/release/3.8.1/data/nexus/3.4.0-02/1/nexus-distrib/src/main/resources
cp -r /datas/sources/novaforge_sources_3.8.0/products/release/shared /datas/sources/novaforge_sources/products/release/
```

In the `/datas/tools/maven/apache-maven-3.0.5/conf/settings.xml` file, 
- Check the local Maven repository is :
```sh
<localRepository>/datas/repoMaven</localRepository>
```
- if needed, provide the setting of a proxy to access to Internet :
```sh
    <proxy>
      <active>true</active>
      <protocol>http</protocol>
      <host>www.xxx.yyy.zzz</host>
      <port>nnn</port>
      <nonProxyHosts></nonProxyHosts>
    </proxy>
```
### Initialize environment
use the following lines at the end of the `config` user's `.bash_profile` file :
```sh
export JAVA_HOME=/datas/tools/jdk/jdk1.7.0_80
#export JAVA_HOME=/datas/tools/jdk/jdk1.8.0_112

export JAVA_OPTS="-Xms512M -Xmx512M -XX:PermSize=256M -XX:MaxPermSize=256M -XX:+CMSClassUnloadingEnabled  -XX:-UseSplitVerifier"
export M2_HOME=/datas/tools/maven/apache-maven-3.0.5
export MAVEN_OPTS="-Xms1024M -Xmx1024M -XX:PermSize=256M -XX:MaxPermSize=512M"
export M2_REPO=/datas/repoMaven

export PATH=$JAVA_HOME/bin:$M2_HOME/bin:$PATH
```
Source this file or perfom a reconnection to have this setting taken into account.

The JDK 1.7 should now be enabled :
```sh
[config@novapack /]$ java -version
java version "1.7.0_80"
Java(TM) SE Runtime Environment (build 1.7.0_80-b15)
Java HotSpot(TM) 64-Bit Server VM (build 24.80-b11, mixed mode)
```

### Build Maven artifacts
All NovaForge main components have to be built in a specific order :
```sh
cd /datas/sources/novaforge_sources/parent
mvn install
cd /datas/sources/novaforge_sources/forge
mvn install
```
The `products` component needs to be built with JDK 1.8.

Modify your `.bash_profile` file to enable the line `export JAVA_HOME=/datas/tools/jdk/jdk1.8.0_112` and source the file.

The JDK 1.8 should now be enabled :
```sh
[config@novapack ~]$ java -version
java version "1.8.0_112"
Java(TM) SE Runtime Environment (build 1.8.0_112-b15)
Java HotSpot(TM) 64-Bit Server VM (build 25.112-b15, mixed mode)
```

```sh
cd /datas/sources/novaforge_sources/products/release
mvn install
```

### Build package
Update the `/datas/tools/maven/apache-maven-3.0.5/conf/settings.xml` file to :
- Add the following mirror :
```sh
    <mirror>
      <id>central</id>
      <mirrorOf>central</mirrorOf>
      <name>Mirror of Central Repository</name>
      <url>file:///datas/repoMaven</url>
    </mirror>
```
(This will force Maven to use the local repository as unique source for package building)
- Comment any `<proxy>...</proxy>` section.

Run the following command :
```sh
/datas/tools/genPackage.sh -x -c /datas/tools/profiles/Bull/3.8.1.package_update.cfg
```
The final package (`package-3.8.1-bull_update.tar.gz`) will be generated in a `/datas/tmp/bull_3.8.1.********` folder.

## Installation
All the following actions have to be performed as `root` user.

Retrieve and untar the recently built package (`package-3.8.1-bull_update.tar.gz`) :
```sh
cd /livraison
tar -zxvf package-3.8.1-bull_update.tar.gz
rm package
ln -s package-3.8.1-bull_update package
```

### Deploy NovaForge
Stop current Novaforge version
```sh
systemctl stop mysql httpd sendmail sympa nexus jenkins sonar gitlab cas novaforge
```
Run the following command :
```sh
/livraison/package/install.sh -v -t aio -i aio -p bull -c /livraison/novaforge.cfg -l /livraison/package/repository -o > /livraison/install_3.8.1.log 2>&1 &
```
You can monitor the component installation by running the following command :
```sh
tail -f install_3.8.1.log | grep Processing
```
The log file should end with lines similar to :
```sh
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 17:25.195s
[INFO] Finished at: Fri Oct 06 11:00:41 CEST 2017
[INFO] Final Memory: 39M/118M
[INFO] ------------------------------------------------------------------------
[WARNING] The requested profile "bull" could not be activated because it does not exist.
---------------------------------------------------------------------------
----- Clean working directory
################################################################################
######
###### End of installation
######
################################################################################
```

### Start/stop NovaForge
The NovaForge start is to be performed through this `systemctl` command : `systemctl start novaforge`.

The log file related to the Karaf container can be found in the `/datas/novaforge3/logs/karaf` folder.

You can consider NovaForge as available when the message "NovaForge Initialization: FINISHED SUCCESSFULLY" appears in the log file :
```sh
[root@novatest karaf]# tail -f karaf.log | grep SUCCESS
2017-10-06 11:13:12,604 | INFO  | lixDispatchQueue | RoleHandler                      | 402 - novaforge-requirements-tool-common-impl - 3.8.1 | Requirements Manager Initialization : FINISHED SUCCESSFULLY.
2017-10-06 11:13:24,656 | INFO  | lixDispatchQueue | RoleHandler                      | 425 - novaforge-delivery-manager-tool-impl - 3.8.1 | Delivery Manager Initialization : FINISHED SUCCESSFULLY.
2017-10-06 11:13:45,543 | INFO  | lixDispatchQueue | ForgeInitializator               | 503 - novaforge-initialization - 3.8.1 | NovaForge Initialization: FINISHED SUCCESSFULLY.
```

Regarding the shutdown, each component must be stopped individually.

So, to stop the whole Forge, run this command :
```sh
systemctl stop mysql httpd sendmail sympa nexus jenkins sonar gitlab cas novaforge
```
(Running the `systemctl stop novaforge` command will only stop the Karaf container.)

## Usage
Through your Internet browser, access to the URL `https://novatest`.

The main page will allow you to :
- access to NovaForge with an existing account,
- create a new account and enter NovaForge with it.

The NovaForge "Super User" account is referred as the "Forge Administrator".

By default, the associated login/password is `admin1/novaforge_1`.

To have more information regarding NovaForge functionnalities, you can browse the online help available from the drop-down list accessible by clicking on the "Firstname Lastname" text at the upper right part of the screen. 

## Licensing

```sh
Copyright (c) 2011-2017, BULL, an Atos Company.
NovaForge Version 3 and above.

This Program is free software: you may redistribute and/or modify it under
the terms of the GNU Affero General Public License as published by the
Free Software Foundation, version 3 of the License.

This Program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details (http://www.gnu.org/licenses).

Additional permission under GNU AGPL version 3 (AGPL-3.0) section 7.

If you modify this Program, or any covered work, by linking or combining
it with libraries listed in COPYRIGHT file at the top-level directory of
this distribution (or a modified version of that libraries), containing parts
covered by the terms of licenses cited in the COPYRIGHT file, the licensors
of this Program grant you additional permission to convey the resulting work.
```
