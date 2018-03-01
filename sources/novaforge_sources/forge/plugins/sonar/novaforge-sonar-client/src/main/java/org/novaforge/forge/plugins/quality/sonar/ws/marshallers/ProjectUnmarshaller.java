package org.novaforge.forge.plugins.quality.sonar.ws.marshallers;

import java.lang.reflect.Type;
import java.util.List;

import org.novaforge.forge.plugins.quality.sonar.ws.models.Project;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ProjectUnmarshaller {
  
  public static List<Project> parse(String json) {
    Gson gson = new Gson();
		Type collectionType = new TypeToken<List<Project>>(){
		}.getType();
		
    return gson.fromJson(json, collectionType);
	}
}
