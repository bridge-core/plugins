// More on plugins: "https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md"
Bridge.registerPlugin({
	author: "solvedDev",
	version: "1.0.0",
	name: "Dynamic JSON",
	description: "A compiler which can speed up creating repetitive JSON by writing loop statements and shared data inside the new \"variables\" state."
});

Bridge.Language.addKeywords(["bridge", "variables"]);

Bridge.on("bridge:beforePropose", ({ propose, node }) => {
  if(propose.object == undefined) return;
  
  if(node.key == "minecraft:entity") propose.object.unshift("variables");
  if(node.key != "bridge:loop" && node.key != "value") propose.object.unshift("bridge:loop");
});

Bridge.on("bridge:addedNode", ({ node }) => {
  if(node.key == "bridge:loop") {
    node.propose = function() {
    	return { object: [ "value", "content" ], value: undefined };
    } 
  } else if(node.parent.key == "bridge:loop" && node.key == "content") {
    node.propose = function() {
    	return node.parent.parent.propose();
    } 
  }
});

let EVAL_CONTEXT = {};

Bridge.on("bridge:saveFile", ({ content, file_extension }) => {
  if(file_extension != "json") return;
  setupContext(content);
  
  for(let node of content) {
    if(node.key == "bridge:loop") {
      compileLoop(node);
    }
  }
  
  Bridge.trigger("solved:compiledLoops", { content, file_extension });
});

function setupContext(content) {
  let vars = content.get("minecraft:entity/variables").toJSON();
  for(let key in vars) {
    if(typeof vars[key] == "object") EVAL_CONTEXT[key] = vars[key];
    else EVAL_CONTEXT[key] = evalStatement(vars[key], { index: 0, vars: EVAL_CONTEXT });
  }
  if(vars) content.get("minecraft:entity/variables").remove();
}

function compileLoop(loop_node) {
  let context = loop_node.parent;
  let data = loop_node.get("content");
  let value = loop_node.get("value").toJSON();
  
  if(data == undefined || value == undefined) return;
  if(typeof value == "string") value = evalStatement(value.substring(2, value.length - 1), { index: 0, vars: EVAL_CONTEXT });
  
  for(let i = 0; i < value; i++) {
    let clone = data.deepClone();
    for(let node of clone) {
      if(node.key[0] == "$") {
        node.key = evalStatement(node.key.substring(2, node.key.length - 1), { index: i, vars: EVAL_CONTEXT }, node);
      }
      if(node.data[0] == "$") {
        node.data = evalStatement(node.data.substring(2, node.data.length - 1), { index: i, vars: EVAL_CONTEXT }, node);
      }
    }
    context.buildFromObject(clone.toJSON());
  }
  loop_node.remove();
}

function evalStatement(expr, context, node) {
  return (function({ index, vars }, load) { return eval(expr); })(context, (obj) => {
    if(node == undefined) return;
    node.buildFromObject(obj);
  });
}