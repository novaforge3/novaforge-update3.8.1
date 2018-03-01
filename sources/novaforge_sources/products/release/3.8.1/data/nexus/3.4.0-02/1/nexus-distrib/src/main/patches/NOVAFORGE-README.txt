Nexus 3.4.0-02 distribution modified par the Novaforge team to support the CAS authentication.

Configuration files are unchanged. Changes concern files stored in the maven repository of Nexus ($HOME/nexus-3.4.0-02/system directory).

The patching process:

1- replace the system/com/sonatype/nexus/assemblies/nexus-oss-feature/3.4.0-02/nexus-oss-feature-3.4.xml file (add the nexus-cas-plugin feature)
2- add the system/org/novaforge/nexus/nexus-cas-plugin/3.4.0-02/nexus-cas-plugin-3.4.0-02.jar
3- replace the the following files into system/com/sonatype/nexus/nexus-security/nexus-security-3.4.0-02.jar:
	- AuthorizingRealmImpl.java
	- CasAuthenticationService.java
	- CasLogoutService.java
	- CasTokenAuthenticatingRealm.java
	- CasUtil.java
	- InitialRealmConfigurationProvider.java
	- NovaForgeCasConfigProvider.java
	- NovaForgeCasFilter.java
	- NovaForgePasswordMatcher.java
	- NovaForgeRealmImpl.java
	- NovaForgeSecurityFilterModule.java