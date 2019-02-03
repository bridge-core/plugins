// More on plugins: "https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md"

Bridge.registerPlugin({
	author: "solvedDev",
	version: "v1.0.0",
	name: "Better Events",
	description: "Adds new features to Minecraft's event syntax"
});

Bridge.on("bridge:beforePropose", ({ propose, node }) => {
  if(propose.object == undefined) return;
  
  if(node.key == "component_groups" && node.parent && /add|remove/.test(node.parent.key)) {
    propose.object.unshift("all");
  }
});

Bridge.on("bridge:addedNode", ({ node }) => {
  if(node.key == "all") {
    node.propose = function() {
    	return { object: [ "includes" ], value: undefined };
    } 
  }
});

Bridge.on("solved:compiledLoops", ({ content, file_extension }) => {
  if(file_extension != "json") return;
  let groups = Object.keys(content.get("minecraft:entity/component_groups").toJSON());
  console.log(groups,content.get("minecraft:entity/events"));
  for(let node of content.get("minecraft:entity/events")) {
    
    if(node.key == "all") {
      let context = node.parent;
      let filter = node.get("includes").toJSON();

      node.remove();
      context.buildFromObject(groups.filter(g => g.includes(filter)));
    }
  }
});