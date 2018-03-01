package org.novaforge.forge.plugins.quality.sonar.ws.models;

/**
* Json binding of the Groups result
* 
* <br/>
* <pre>
*
*  "groups": [
*   {
*     "name": "Anyone",
*     "selected": true
*   },
*   {
*     "id": "1",
*     "name": "sonar-administrators",
*     "description": "System administrators",
*     "selected": true
*   },
*   {
*     "id": "2",
*    "name": "sonar-users",
*    "description": "Any new users created will automatically join this group",
*    "selected": true
*   }
*  ],
*  "paging": {
*    "pageIndex": 1,
*    "pageSize": 100,
*    "total": 3
*   }
* </pre>
 *
 */

public class Group {
	
 private String id;
 private String name;
 private String description;
 private boolean selected;
  
 public Group(String id, String name, String description, boolean selected) {
  super();
  this.id = id;
  this.name = name;
  this.description = description;
  this.selected = selected;
  }
	
 public String getId() {
  return id;
  }

 public String getName() {
  return name;
  }
	
 public String getDescription (){
  return description;
  }
 
 public boolean getSelected(){
  return selected;
  }

}
