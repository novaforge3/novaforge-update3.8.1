package org.novaforge.forge.plugins.quality.sonar.ws.models;

import java.util.List;

public class Groups {

  private List<Group> groups;

  public Groups(List<Group> groups) {
   super();
   this.groups = groups;
   }

  public List<Group> getGroups() {
   return groups;
   }

}
