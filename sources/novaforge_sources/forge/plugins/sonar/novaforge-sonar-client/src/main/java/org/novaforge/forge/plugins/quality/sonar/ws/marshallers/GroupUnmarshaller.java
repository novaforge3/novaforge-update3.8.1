package org.novaforge.forge.plugins.quality.sonar.ws.marshallers;

import org.novaforge.forge.plugins.quality.sonar.ws.models.Groups;

import com.google.gson.Gson;

public class GroupUnmarshaller {

  public static Groups parse(String json) {
    Gson gson = new Gson();
    return gson.fromJson(json, Groups.class);
  }
}
