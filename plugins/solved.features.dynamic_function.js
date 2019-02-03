// More on plugins: "https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md"

Bridge.registerPlugin({
	author: "solvedDev",
	version: "1.0.0",
	name: "Dynamic Function",
	description: "Adds the new /dynamicfunction & /func command which can be used to pass arguments to a .mcfunction file."
});


Bridge.BuildableFile.register({
    options: {
        extension: "func",
        display_name: "Dynamic Function",
        path: "functions/"
    },
    sidebar_element: {
        title: "Dynamic Function",
        icon: "mdi-function-variant"
    },
    templates: [
        {
            display_name: "Dynamic Function Example",
            content: "# Dynamic functions allow the usage of function arguments. Those arguments start with a \"$\" char. Upon calling a dynamic function with either \"func\" or \"dynamicfunction\", one can pass the arguments to the function. E.g. \"/func test $my_var=@a $my_sec_var=HelloWorld!\"\nsay Hello $my_var!"
        }
    ]
});

Bridge.on("bridge:saveFile", ({ content, file_extension, file_path }) => {
  if(file_extension != "mcfunction") return;
  
  return { content: processFunc(content) };
});

function processFunc(content, save_file=false, new_path) {
  let funcs = content.match(/(\ndynamicfunction ).+|(\nfunc ).+/g);
  
  if(funcs != null) funcs.forEach(f => {
    let struc = f.split(" ");
	struc.shift();
    let func_name = struc.shift();
    let new_func_path = "functions/" + func_name + "/dynamic" + "_" + struc.join("_").replace(/\W/g, "_");
    let new_func_command = "\nfunction " + new_func_path.replace("functions/", "");
    
    Bridge.FS.readFile("functions/" + func_name + ".func", (err, data) => {
      if(err) throw err;
      let c = data.toString();
      
      struc.forEach(s => {
        let args = s.split("=");
        c = c.replace(new RegExp(args.shift().replace("$", "\\$") + "(?=[^=])", "g"), args.shift());
      });
      
      processFunc(c, true, new_func_path);
    });
    
    content = content.replace(f, new_func_command);
  });

  if(save_file) Bridge.FS.writeFile(new_path + ".mcfunction", content);
  
  return content;
}