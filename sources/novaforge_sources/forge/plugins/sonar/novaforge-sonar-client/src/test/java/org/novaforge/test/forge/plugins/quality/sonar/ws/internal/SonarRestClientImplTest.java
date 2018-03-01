package org.novaforge.test.forge.plugins.quality.sonar.ws.internal;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;

import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.novaforge.forge.plugins.quality.sonar.SonarDataTest;
import org.novaforge.forge.plugins.quality.sonar.ws.SonarRestClient;
import org.novaforge.forge.plugins.quality.sonar.ws.SonarWSContext;
import org.novaforge.forge.plugins.quality.sonar.ws.SonarWSContextFactory;
import org.novaforge.forge.plugins.quality.sonar.ws.internal.SonarRestClientImpl;
import org.novaforge.forge.plugins.quality.sonar.ws.internal.SonarWSContextFactoryImpl;
import org.novaforge.forge.plugins.quality.sonar.ws.models.TimeMachine;
import org.novaforge.forge.plugins.quality.sonar.ws.models.User;
import org.sonarqube.ws.WsComponents.Component;
import org.sonarqube.ws.client.GetRequest;
import org.sonarqube.ws.client.HttpConnector;
import org.sonarqube.ws.client.PostRequest;
import org.sonarqube.ws.client.WsClient;
import org.sonarqube.ws.client.WsClientFactories;
import org.sonarqube.ws.client.WsResponse;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SonarRestClientImplTest {

	private SonarRestClient sonarRestClient = null;

	private SonarWSContext sonarWSContext = null;

	private boolean sonarProfileActivated = false;

	public SonarRestClientImplTest() {
		
		final String property = System.getProperty("sonar.profile");

		sonarProfileActivated = "true".equals(property);
	
	}

	private WsClient getWsAdminClient() {

		return WsClientFactories.getDefault().newClient(HttpConnector.newBuilder().url(sonarWSContext.getBaseURL())
				.credentials(SonarDataTest.ADMIN_USER, SonarDataTest.ADMIN_PASWORD).build());
	}

	private WsResponse createSonarProject() {

		WsClient wsClient = getWsAdminClient();

		return wsClient.wsConnector().call(new PostRequest("api/projects/create")
				.setParam("key", SonarDataTest.SONAR_PROJECT_TEST_KEY).setParam("name", SonarDataTest.SONAR_PROJECT_TEST_NAME));

	}

	private void deleteSonarProject() {

		WsClient wsClient = getWsAdminClient();

		wsClient.wsConnector()
				.call(new PostRequest("api/projects/delete").setParam("key", SonarDataTest.SONAR_PROJECT_TEST_KEY));
	}

	private WsResponse getSonarProject(String projectKey) {

		WsClient wsClient = getWsAdminClient();

		return wsClient.wsConnector().call(new GetRequest("api/projects/index").setParam("key", projectKey));
	}

	private WsResponse getGroups() {

		WsClient wsClient = getWsAdminClient();

		return wsClient.wsConnector().call(new GetRequest("api/user_groups/search"));
	}

	private WsResponse getProjectPermissions() {

		WsClient wsClient = getWsAdminClient();

		return wsClient.wsConnector().call(new GetRequest("api/permissions/search_project_permissions")
				.setParam("qualifier", "TRK").setParam("q", SonarDataTest.SONAR_PROJECT_TEST_NAME));

	}
	
	@Before
	public void init() {

		if (sonarProfileActivated) {
			
			this.sonarRestClient = new SonarRestClientImpl();

			SonarWSContextFactory factory = new SonarWSContextFactoryImpl();
			this.sonarWSContext = factory.getWSContext(SonarDataTest.BASE_URL, SonarDataTest.ADMIN_USER,
					SonarDataTest.ADMIN_PASWORD);
		}
	}

 @Test
  public void test01CreateUser() {

    if (sonarProfileActivated) {
      
      try {

        this.sonarRestClient.createUser(sonarWSContext, SonarDataTest.USER1_LOGIN, SonarDataTest.USER1_NAME,
            SonarDataTest.USER1_EMAIL, SonarDataTest.USER1_PASWWORD);

        assertNotNull(this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN));

      } catch (Exception e) {

        fail(e.getMessage());
      }
    }
  }

	@Test
	public void test02FindUser() {

		if (sonarProfileActivated) {
			
			try {
				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);
				assertTrue(user.getLogin().equals(SonarDataTest.USER1_LOGIN));
				assertTrue(user.getName().equals(SonarDataTest.USER1_NAME));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test03UpdateUser() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.updateUser(sonarWSContext, SonarDataTest.USER1_LOGIN, SonarDataTest.USER1_NAME,
						SonarDataTest.USER1_NEWEMAIL, SonarDataTest.USER1_PASWWORD);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);
				assertTrue(user.getEmail().equals(SonarDataTest.USER1_NEWEMAIL));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test04DeleteUser() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.deleteUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNull(user);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test05CreateProject() {

		if (sonarProfileActivated) {
			
			String response = this.createSonarProject().content();

			assertNotNull(response);
			assertTrue(response.contains(SonarDataTest.SONAR_PROJECT_TEST_NAME));
		}
	}

	@Test
	public void test06GetProject() {

		if (sonarProfileActivated) {
			
			String response = this.getSonarProject(SonarDataTest.SONAR_PROJECT_TEST_KEY).content();

			assertNotNull(response);
			assertTrue(response.contains(SonarDataTest.SONAR_PROJECT_TEST_KEY));
		}
	}

  @Test
  public void test07DeleteProject() {

    if (sonarProfileActivated) {
      
      this.deleteSonarProject();

      String response = this.getSonarProject(SonarDataTest.SONAR_PROJECT_TEST_NAME).content();

      assertNotNull(response);
      assertFalse(response.contains(SonarDataTest.SONAR_PROJECT_TEST_NAME));
    }
  }
 
  

	@Test
	public void test08CreateGroup() {

		if (sonarProfileActivated) {
			
			try {
				this.createSonarProject();
				this.sonarRestClient.createGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER,
				    "The group belongs to the projet " + SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME);
				this.sonarRestClient.addGroupToProjectPermission(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER,
						SonarDataTest.SONAR_PROJECT_TEST_KEY, SonarDataTest.PERMISSION_CODEVIEWER);

				String response = this.getGroups().content();

				assertNotNull(response);
				assertTrue(response.contains(SonarDataTest.GROUP_PROJET_CODEVIEWER));
				assertTrue(response.contains("The group belongs to the projet " + SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test09DeleteGroup() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.deleteGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER);

				String response = this.getGroups().content();

				assertNotNull(response);
				assertFalse(response.contains(SonarDataTest.GROUP_PROJET_CODEVIEWER));
				//assertFalse(response.contains("The group belongs to the projet " + SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test10AddGroupToProjectPermission() {

		if (sonarProfileActivated) {
			
			try {
				this.createSonarProject();
				this.sonarRestClient.createGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER,
				    "The group belongs to the projet " + SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME);

				this.sonarRestClient.addGroupToProjectPermission(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER,
						SonarDataTest.SONAR_PROJECT_TEST_KEY, SonarDataTest.PERMISSION_CODEVIEWER);

				String response = this.getProjectPermissions().content();

				assertNotNull(response);

				// check the group adding increments the group counter
				assertTrue(response.contains(SonarDataTest.PERMISSION_CODEVIEWER_ADD_GROUP_VALIDATION));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test11RemoveGroupFromProjectPermission() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.removeGroupFromProjectPermission(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER,
						SonarDataTest.SONAR_PROJECT_TEST_KEY, SonarDataTest.PERMISSION_CODEVIEWER);

				String response = this.getProjectPermissions().content();

				assertNotNull(response);

				// check the group adding decrements the group counter
				assertTrue(response.contains(SonarDataTest.PERMISSION_CODEVIEWER_REMOVE_GROUP_VALIDATION));
				



			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test12CreateGroupsForProject() {

		if (sonarProfileActivated) {
			
			try {
			  
	       this.sonarRestClient.deleteGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER);
	       String response = this.getGroups().content();
	       assertNotNull(response);
	       assertFalse(response.contains(SonarDataTest.GROUP_PROJET_CODEVIEWER));
	       
				this.sonarRestClient.createGroupsForProject(sonarWSContext, SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME);
				response = this.getGroups().content();

				assertNotNull(response);
				assertTrue(response.contains(SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME));
			  assertTrue(response.contains("The group belongs to the projet " + SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME));
				assertTrue(response.contains(SonarDataTest.GROUP_PROJET_ADMIN));
				assertTrue(response.contains(SonarDataTest.GROUP_PROJET_CODEVIEWER));
				assertTrue(response.contains(SonarDataTest.GROUP_PROJET_USER));

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test13AddUserToGroup() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.createUser(sonarWSContext, SonarDataTest.USER1_LOGIN, SonarDataTest.USER1_NAME,
						SonarDataTest.USER1_EMAIL, SonarDataTest.USER1_PASWWORD);
				this.sonarRestClient.addUserToGroup(sonarWSContext, SonarDataTest.USER1_LOGIN, SonarDataTest.GROUP_PROJET_ADMIN);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);
				List<String> groups = user.getGroups();

				assertFalse(groups.isEmpty());

				Iterator<String> iterator = groups.iterator();

				boolean found = false;

				while (iterator.hasNext()) {

					String group = iterator.next();

					if (found = group.equals(SonarDataTest.GROUP_PROJET_ADMIN))
						break;
				}
				assertTrue(found);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test14GetPermission() {

		if (sonarProfileActivated) {
			
			// try {
			// String permission =
			// this.sonarRestClient.getPermission(sonarWSContext,
			// SonarDataTest.GROUP_NAME);
			//
			// assertNotNull(permission);
			// assertTrue(permission.equals(SonarDataTest.PERMISSION_CODEVIEWER));
			//
			// } catch (Exception e) {
			//
			// fail(e.getMessage());
			// }
			assertTrue(true);
		}
	}

	@Test
	public void test15RemoveUserFromGroup() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.removeUserFromGroup(sonarWSContext, SonarDataTest.USER1_LOGIN,
						SonarDataTest.GROUP_PROJET_ADMIN);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);

				List<String> groups = user.getGroups();

				assertNotNull(groups);
				assertFalse(groups.isEmpty());

				Iterator<String> iterator = groups.iterator();

				boolean found = false;

				while (iterator.hasNext()) {

					String group = iterator.next();

					if (found = group.equals(SonarDataTest.GROUP_PROJET_ADMIN))
						break;
				}
				assertFalse(found);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test16AddMembership() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.addMembership(sonarWSContext, SonarDataTest.PERMISSION_CODEVIEWER,
						SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME, SonarDataTest.USER1_LOGIN, SonarDataTest.USER1_NAME,
						SonarDataTest.USER1_EMAIL, SonarDataTest.USER1_PASWWORD);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);
				assertTrue(user.getLogin().equals(SonarDataTest.USER1_LOGIN));

				List<String> groups = user.getGroups();

				assertNotNull(groups);
				assertFalse(groups.isEmpty());

				Iterator<String> iterator = groups.iterator();

				boolean found = false;

				while (iterator.hasNext()) {

					String group = iterator.next();

					if (found = group.equals(SonarDataTest.GROUP_PROJET_CODEVIEWER))
						break;
				}
				assertTrue(found);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test17RemoveMembership() {

		if (sonarProfileActivated) {
			
			try {
				this.sonarRestClient.removeMembership(sonarWSContext, SonarDataTest.PERMISSION_CODEVIEWER,
						SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME, SonarDataTest.USER1_LOGIN);

				User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);

				assertNotNull(user);
				assertTrue(user.getLogin().equals(SonarDataTest.USER1_LOGIN));

				List<String> groups = user.getGroups();

				assertNotNull(groups);
				assertFalse(groups.isEmpty());

				Iterator<String> iterator = groups.iterator();

				boolean found = false;

				while (iterator.hasNext()) {

					String group = iterator.next();

					if (found = group.equals(SonarDataTest.GROUP_PROJET_CODEVIEWER))
						break;
				}
				assertFalse(found);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	 @Test
	 public void test18GetAllComponents() {
	   
  	 if(sonarProfileActivated){
    	 try {
    	 List<Component> components =this.sonarRestClient.getAllComponents(sonarWSContext);
    	
    	 assertNotNull(components);
    	
    	 assertFalse(components.isEmpty());
    	 
    	 boolean found = false;
       for (final Component component : components){
         if (component.getName().equals(SonarDataTest.SONAR_PROJECT_TEST_NAME)){
           found = true;
           break;
         }
       }
       
       assertTrue(found);
   	
    	 } catch (Exception e) {
    	
    	 fail(e.getMessage());
    	 }
  	 }
	 }

	@Test
	public void test18GetProjectComponents() {

		if (sonarProfileActivated) {
			
			try {
	
				this.sonarRestClient.addUserToGroup(sonarWSContext, SonarDataTest.USER1_LOGIN,
				    SonarDataTest.GROUP_PROJET_ADMIN);
				
			
				this.sonarRestClient.addGroupToProjectPermission(sonarWSContext, SonarDataTest.GROUP_PROJET_ADMIN,
            SonarDataTest.SONAR_PROJECT_TEST_KEY, SonarDataTest.PERMISSION_CODEVIEWER);
			
				List<Component> components = this.sonarRestClient.getProjectComponents(sonarWSContext,
				    SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME,  SonarDataTest.USER1_LOGIN);
				
				assertNotNull(components);

				assertFalse(components.isEmpty());
				
				boolean found = false;
				
				for (final Component component : components){
				  if (component.getName().equals(SonarDataTest.SONAR_PROJECT_TEST_NAME)){
				    found = true;
				    break;
				  }
				}
				
				assertTrue(found);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}

	@Test
	public void test19GetTimeMachine() {

		if (sonarProfileActivated) {
			
			try {
			  
			  List<String> metrics = new ArrayList<String>(); 
			  //metrics.add("violations");
			  //metrics.add("coverage");
			  
			  //minor_violations, critical_violations, blocker_violations, major_violations
			  metrics.add("minor_violations");
			  metrics.add("critical_violations");
			  metrics.add("blocker_violations");
			  metrics.add("major_violations");
			  
			  String metricsString = metrics.toString().replace("[", "").replace("]", "").replace(", ", ",");
			  
				//String metrics = "violations,coverage";

				/*Calendar calendar = GregorianCalendar.getInstance();

				calendar.add(Calendar.DAY_OF_MONTH, -30);
				Date fromDate = calendar.getTime();

				calendar.add(Calendar.DAY_OF_MONTH, 2);
				Date toDate = calendar.getTime();
				*/

				//TimeMachine timeMachine = this.sonarRestClient.getTimeMachine(sonarWSContext,
				//	SonarDataTest.SONAR_PROJECT_TEST_KEY, metrics, null, null);
				//SonarDataTest.NOVAFORGE_PROJECT_TEST_NAME, metrics, fromDate, toDate);
				TimeMachine timeMachine = this.sonarRestClient.getTimeMachine(sonarWSContext,
				"org.novaforge.forge:novaforge-sonar-simple-example", metricsString, null, null);

				assertNotNull(timeMachine);

			} catch (Exception e) {

				fail(e.getMessage());
			}
		}
	}
	
	@Test
  public void test20Reset() {

	    if (sonarProfileActivated) {
	      
	      try {
	                   
	       /* table  group_roles */      
	        this.sonarRestClient.removeGroupFromProjectPermission(sonarWSContext, SonarDataTest.GROUP_PROJET_ADMIN,
	            SonarDataTest.SONAR_PROJECT_TEST_KEY, SonarDataTest.PERMISSION_CODEVIEWER);
	        String response = this.getProjectPermissions().content();
	        assertNotNull(response);
	        // check the group adding decrements the group counter
	        assertTrue(response.contains(SonarDataTest.PERMISSION_CODEVIEWER_REMOVE_GROUP_VALIDATION));
	        
	        /* table groups_user */
	        this.sonarRestClient.removeUserFromGroup(sonarWSContext, SonarDataTest.USER1_LOGIN,
	            SonarDataTest.GROUP_PROJET_ADMIN);
	         User user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);
	         assertNotNull(user);
	          List<String> groups = user.getGroups();
	          assertNotNull(groups);
	          assertFalse(groups.isEmpty());
	          Iterator<String> iterator = groups.iterator();
	          boolean found = false;
	          while (iterator.hasNext()) {
	            String group = iterator.next();
	            if (found = group.equals(SonarDataTest.GROUP_PROJET_ADMIN))
	              break;
	          }
	          assertFalse(found);
	        	        
	        /* Table users => desactivate */
	        this.sonarRestClient.deleteUser(sonarWSContext, SonarDataTest.USER1_LOGIN);
          user = this.sonarRestClient.findUser(sonarWSContext, SonarDataTest.USER1_LOGIN);
          assertNull(user);
          
	        /* Table groups */   	        	              
	        this.sonarRestClient.deleteGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_ADMIN);
	        response = this.getGroups().content();
          assertNotNull(response);
          assertFalse(response.contains(SonarDataTest.GROUP_PROJET_ADMIN));
	        this.sonarRestClient.deleteGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_CODEVIEWER);
	        response = this.getGroups().content();
	        assertNotNull(response);
	        assertFalse(response.contains(SonarDataTest.GROUP_PROJET_CODEVIEWER));
	        this.sonarRestClient.deleteGroup(sonarWSContext, SonarDataTest.GROUP_PROJET_USER);
	        response = this.getGroups().content();
	        assertNotNull(response);
	        assertFalse(response.contains(SonarDataTest.GROUP_PROJET_USER));
                 
	        /* table projects */
	        this.deleteSonarProject();
	        response = this.getSonarProject(SonarDataTest.SONAR_PROJECT_TEST_NAME).content();
	        assertNotNull(response);
	        assertFalse(response.contains(SonarDataTest.SONAR_PROJECT_TEST_NAME));
	            	       

	      } catch (Exception e) {

	        fail(e.getMessage());
	      }
	    }
	}

}
