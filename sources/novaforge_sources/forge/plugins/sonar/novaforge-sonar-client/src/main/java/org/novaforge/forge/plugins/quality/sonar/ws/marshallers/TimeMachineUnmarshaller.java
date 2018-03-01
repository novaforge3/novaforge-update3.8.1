package org.novaforge.forge.plugins.quality.sonar.ws.marshallers;

import java.lang.reflect.Type;
import java.util.List;

import org.novaforge.forge.plugins.quality.sonar.ws.models.TimeMachine;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class TimeMachineUnmarshaller {

	
	public static List<TimeMachine> parse(String json) {
		Gson gson = new Gson();	
		Type collectionType = new TypeToken<List<TimeMachine>>(){
		}.getType();
    
    return gson.fromJson(json, collectionType);
    
	}	
}
