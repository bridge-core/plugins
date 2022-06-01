<template>
	<div class="px-4" style="overflow-y: scroll; scroll-behavior: smooth;">
		<h1 id="top">Custom Command Toolbox Documentation</h1>
		<button type="button" class="mb-2 v-btn v-btn--has-bg theme--dark v-size--default" style="position:absolute;bottom:25px;right:25px;" onclick="window.location.href='#top'">top</button>
		<p>
			This is the documentation for the custom commands found within this extension. This file will guide you on how each of the commands are used.<br>
			If the extension is installed locally, the <code>BP/structures/bridge/</code> and <code>BP/commands/toolbox/</code> folders should have been created.<br>
			If the extension is installed globally, these required folders and their contents will be auto-generated when the user creates a new project. <br><br>
			If you are having trouble, join the <a href="https://discord.gg/Maeq5ZtpVk">MCBE Essentials</a> discord server.
		</p>
		<fieldset style="display: inline-block">
			<legend>Table of Contents</legend>
			<ul>
				<li><a href="#buildtext">buildtext</a></li>
				<li><a href="#compare">compare</a></li>
				<li><a href="#dropitem">dropitem</a></li>
				<li><a href="#explode">explode</a></li>
				<li><a href="#flip">flip</a></li>
				<li><a href="#kit">kit</a></li>
				<li><a href="#log">log</a></li>
				<li><a href="#mobwave">mobwave</a></li>
				<li><a href="#palette">palette</a></li>
				<li><a href="#random">random</a></li>
				<li><a href="#repeat">repeat</a></li>
				<li><a href="#rotate">rotate</a></li>
				<li><a href="#scoredetails">scoredetails</a></li>
				<li><a href="#shape">shape</a></li>
				<li><a href="#sudo">sudo</a></li>
				<li><a href="#toggletag">toggletag</a></li>
				<li><a href="#xpdisplay">xpdisplay</a></li>
			</ul>
		</fieldset>
		<br><br>
		<h2 id="buildtext">buildtext</h2>
		Writes a string of capital letters at the coordinates of your choice.<br>
		<b>Syntax: </b> <code>buildtext &lt;text: string&gt; &lt;tileName: block&gt; &lt;tileData: int&gt; &lt;start: x y z&gt; &lt;facing: +x|-x|+z|-z&gt; [spacing: int]</code><br>
		<b>Example: </b> <code>buildtext "Hello World!" diamond_block 0 150 150 150 +x 1</code>
		<ul>
			<li><code>text: string</code> - The string to build. Supports quotes.</li>
			<li><code>tileName: block</code> - The block identifier to build the text out of.</li>
			<li><code>tileData: int</code> - The block data of tileName.</li>
			<li><code>start: x y z</code> - The coordinates where the bottom corner of the first letter will appear</li>
			<li><code>facing: +x|-x|+z|-z</code> - What direction the letters will generate in and stretch out towards</li>
			<li><code>spacing: int</code> - How many blocks of air in between each letter. Defaults to 1 if unspecified.</li>
		</ul>
		<br>
		<h2 id="compare">compare</h2>
		Executes a command if one score is matches the comparison of the other on an entity.<br>
		<b>Syntax: </b> <code>compare &lt;target: selector&gt; &lt;score1: objective&gt; &lt;operator: operator&gt; &lt;score2: objective&gt; &lt;command: command&gt;</code><br>
		<b>Example: </b> <code>compare @s foo != bar say Foo is not equal to bar.</code>
		<ul>
			<li><code>target: selector</code> - The command will target this entity and compare its scoreboard values. The command will also be executed from this entity.</li>
			<li><code>score1: objective</code> - The first objective to compare.</li>
			<li><code>operator: operator</code> - The operator to compare the scores. Must be <code>==</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, or <code>!=</code></li>
			<li><code>score2: objective</code> - The second objective to compare.</li>
			<li><code>command: command</code> - The command to execute if the operation is true. This command will execute from the <code>target: selector</code></li>
		</ul>
		<br>
		<h2 id="dropitem">dropitem</h2>
		Drops one or more items at the specified coordinates. The limit for how many items can be dropped at once is its stack size.<br>
		<b>Syntax: </b> <code>dropitem &lt;item: item&gt; &lt;amount: int&gt; &lt;position: x y z&gt;</code><br>
		<b>Example: </b> <code>dropitem diamond 3 125 125 125</code>
		<ul>
			<li><code>item: item</code> - The type of item to drop.</li>
			<li><code>amount: int</code> - The amount of item to drop. Note that this must not exceed the item's maximum stack size.</li>
			<li><code>position: x y z</code> - The place where the item(s) will be dropped.</li>
		</ul>
		<br>
		<h2 id="explode">explode</h2>
		Creates an ender crystal-sized explosion at a given point.<br>
		<b>Syntax: </b> <code>explode &lt;position: x y z&gt;</code><br>
		<b>Example: </b> <code>explode ~ ~5 ~</code>
		<ul>
			<li><code>position: x y z</code> - The place where the explosion will be created.</li>
		</ul>
		<br>
		<h2 id="flip">flip</h2>
		Flips a build on the X axis, Z axis, or both.<br>
		<b>Syntax: </b> <code>flip &lt;from: x y z&gt; &lt;to: x y z&gt; &lt;flipMode: x|z|xz&gt;</code><br>
		<b>Example: </b> <code>flip 100 100 100 120 120 120 xz</code>
		<ul>
			<li><code>from: x y z</code> - The bottom corner of the build</li>
			<li><code>to: x y z</code> - The top corner of the build</li>
			<li><code>flipMode: x|z|xz</code> - Whether to flip the build on the x axis, the z axis or both.</li>
		</ul>
		<br>
		<h2 id="kit">kit</h2>
		Gears up an entity's armor, mainhand, and offhand in one command. It's like multiple /replaceitem commands, but in one line.<br>
		<b>Syntax: </b> <code>kit &lt;target: selector&gt; &lt;head: item&gt; &lt;chest: item&gt; &lt;legs: item&gt; &lt;feet: item&gt; &lt;mainhand: item&gt; &lt;offhand: item&gt; [force: boolean]</code><br>
		<b>Example: </b> <code>kit @s diamond_helmet diamond_chestplate diamond_leggings diamond_boots diamond_sword shield true</code>
		<ul>
			<li><code>target: selector</code> - The command will target this entity and replace its gear.</li>
			<li><code>head: item</code> - The item to go on the entity's head. Stack size of 1 and data value of 0 is enforced.</li>
			<li><code>chest: item</code> - The item to go on the entity's chest. Stack size of 1 and data value of 0 is enforced.</li>
			<li><code>legs: item</code> - The item to go on the entity's legs. Stack size of 1 and data value of 0 is enforced.</li>
			<li><code>feet: item</code> - The item to go on the entity's feet. Stack size of 1 and data value of 0 is enforced.</li>
			<li><code>mainhand: item</code> - The item to go in the entity's main hand. Stack size of 1 and data value of 0 is enforced.</li>
			<li><code>offhand: item</code> - The item to go on the entity's off hand. Stack size of 1 and data value of 0 is enforced. Note that only specific items are compatible with this slot.</li>
			<li><code>force: boolean</code> - By default, if the entity already has items in any of the slots, this command will not attempt to replace them. Making this <code>true</code> forces the new items onto the entity.</li>
		</ul>
		<br>
		<h2 id="log">log</h2>
		Puts a message in chat that's only visible if you export the addon in development mode (compiling to com.mojang folder).<br>
		<b>Syntax: </b> <code>log &lt;creativeOnly: boolean&gt; &lt;message: text&gt;</code><br>
		<b>Example: </b> <code>log false This message is visible in dev mode only!</code>
		<ul>
			<li><code>creativeOnly: boolean</code> - Whether the message is only displayed to creative mode players. By default, the message is broadcast in chat to all players when the addon is compiled in the development build.</li>
			<li><code>message: text</code> - The text to be broadcast in chat.<!--<br>
				Referencing additional data (note that <code>&lt;</code> and <code>&gt;</code> must be included in order for this to work):
				<ul>
					<li>Selectors: <code>&lt;selector(@a)&gt;</code>. This will display the selector.</li>
					<li>Scores: <code>&lt;score(player:objective)&gt;</code>. This will display as the player's scoreboard value.</li>
					<li>Localisation Strings: <code>&lt;translate(my.localisation.string)&gt;</code>. This will translate <code>my.localisation.string</code> into the user-selected language.</li>
				</ul>-->
			</li>
		</ul>
		<br>
		<h2 id="mobwave">mobwave</h2>
		Spawns and spreads a wave of entities around a certain point.<br>
		<b>Syntax: </b> <code>mobwave &lt;mob: entity&gt; &lt;amount: int&gt; &lt;position: x y z&gt; &lt;spreadDistance: float&gt; [spawnEvent: event]</code><br>
		<b>Example: </b> <code>mobwave minecraft:creeper 12 ~ ~ ~ 20 minecraft:start_exploding</code>
		<ul>
			<li><code>mob: entity</code> - The mobs to spawn in the wave. Must be a valid entity identifier.</li>
			<li><code>amount: int</code> - How many mobs to be spawned in the wave.</li>
			<li><code>position: x y z</code> - The center point for the mobs to be spread around. <b>Note:</b> Since the command uses <code>/spreadplayers</code>, the Y coordinate is ignored and only there to keep consistency with other commands. </li>
			<li><code>spreadDistance: float</code> - The radius around the center point that the entities are spread.</li>
			<li><code>spawnEvent: event</code> - Each entity is spawned with this event instead of the default, <code>minecraft:entity_spawned</code>.</li>
		</ul>
		<br>
		<h2 id="palette">palette</h2>
		Replaces a slot in the hotbar of a player with an ever-changing palette of items. Run the function every time you want to change blocks. <br>
		⚠️ <b>Note:</b> In order for this command to work as intended, the function should be continuously executing.<br>
		<b>Syntax: </b> <code>palette &lt;paletteName: string&gt; &lt;player: selector&gt; &lt;slot: int&gt; &lt;mode: loop|random&gt; &lt;tiles...&gt;</code><br>
		<b>Example: </b> <code>palette myPalette @p 8 random cobblestone;0 stone;0 stone;1 stone;2 stonebrick;0</code>
		<ul>
			<li><code>paletteName: string</code> - The palette's identifier. This is used in the scoreboard objective to keep track of which item the player should be holding.</li>
			<li><code>player: selector</code> - The player(s) to target with this palette.</li>
			<li><code>slot: int</code> - Which hotbar slot to replace each time. </li>
			<li><code>mode: loop|random</code> - Whether the palette should loop through the list or select a tile at random.</li>
			<li><code>tiles...</code> - A tile-list. Separate each tile with a space and its data value with a semicolon. An example tile list looks like this: <code>cobblestone;0 stone;0 stone;1 stone;2 stonebrick;0</code>. </li>
		</ul>
		<br>
		<h2 id="random">random</h2>
		Executes a command based on random chance. <br>
		<b>Syntax: </b> <code>random &lt;mode: chance|result&gt; &lt;minChance: int&gt; &lt;maxChance: int&gt; &lt;command: command&gt;</code><br>
		<b>Example: </b> <code>random result 0 12 say My randomly selected number is &lt;&amp;result&gt;!</code>
		<ul>
			<li><code>mode: chance|result</code> - If the mode is <code>chance</code>, the command will only execute if the lowest number (minChance) is selected when the random check is made. If the mode is <code>result</code>, the command will execute no matter what but you can change its outcome based on the result of the random chance.</li>
			<li><code>minChance: int</code> - The lowest potential number in the random number check (must be between -2147483648 and 2147483647).</li>
			<li><code>maxChance: int</code> - The highest potential number in the random number check (must be between -2147483648 and 2147483647). Must be greater than the previous argument.</li>
			<li><code>command: command</code> - The command to be run depending on the random chance. <b>Note:</b> If the command mode is <code>result</code>, the result of the random number check can be referenced using <code>&lt;&amp;result&gt;</code>.</li>
		</ul>
		<br>
		<h2 id="repeat">repeat</h2>
		Repeats a specific command. <br>
		<b>Syntax: </b> <code>repeat &lt;loops: int&gt; &lt;command: command&gt;</code><br>
		<b>Example: </b> <code>repeat 12 execute @s[scores={foo=&lt;&amp;loops&gt;}] ~ ~ ~ say My score is &lt;&amp;loops&gt;!</code>
		<ul>
			<li><code>loops: int</code> - The amount of times to rewrite the code.</li>
			<li><code>command: command</code> - The command to be run depending on the random chance. <b>Note:</b> The amount of times the command has looped can referenced using <code>&lt;&amp;loops&gt;</code>.</li>
		</ul>
		<br>
		<h2 id="rotate">rotate</h2>
		Rotates a build on the X and Z axies in any direction of your choice. <br>
		<b>Syntax: </b> <code>rotate &lt;from: x y z&gt; &lt;to: x y z&gt; &lt;degrees: string&gt;</code><br>
		<b>Example: </b> <code>rotate 0 0 0 10 10 10 180_degrees</code>
		<ul>
			<li><code>from: x y z</code> - The bottom corner of the build</li>
			<li><code>to: x y z</code> - The top corner of the build</li>
			<li><code>degrees: string</code> - How many degrees to rotate the structure. Must be <code>0_degrees</code>, <code>90_degrees</code>, <code>180_degrees</code> or <code>270_degrees</code></li>
		</ul>
		<br>
		<h2 id="scoredetails">scoredetails</h2>
		Displays all loaded entities' scoreboard values of a specific objective, in order of closest to furthest from the executer. <br> This command displays in the style of <code>/scoreboard players list</code> and shows the tracked values of <b>loaded entities only</b>.<br>
		<b>Syntax: </b> <code>scoredetails &lt;objective: objective&gt;</code><br>
		<b>Example: </b> <code>scoredetails myObjective</code>
		<ul>
			<li><code>objective: objective</code> - The scoreboard objective to list in chat.</li>
		</ul>
		<br>
		<h2 id="shape">shape</h2>
		Rewrites a command for every block in a shape.<br>
		<b>Syntax: </b> <code>shape rectangle &lt;mode: filled|outline&gt; &lt;start: x y z&gt; &lt;distance: x y z&gt; &lt;command: command&gt;</code><br>
		<b>Example: </b> <code>shape rectangle filled 8 8 8 1 2 3 summon bat ~ ~ ~</code>
		<ul>
			<li><code>rectangle</code> - The type of shape to generate. Currently only supports <code>rectangle</code>.</li>
			<li><code>mode: filled|outline</code> - Whether the center of the shape should be ignored in the coordinates list. </li>
			<li><code>start: x y z</code> - The bottom corner of the build. (Similar to <code>/fill</code>)</li>
			<li><code>end: x y z</code> - The top corner of the build. (Similar to <code>/fill</code>)</li>
			<li><code>command: command</code> - The command to be repeated for every block. Reference the block's position with <code>~ ~ ~</code></li>
		</ul>
		<br>
		<h2 id="sudo">sudo</h2>
		Broadcasts a fake chat message as if it was said by another player.<br>
		<b>Syntax: </b> <code>sudo &lt;player: selector&gt; &lt;message: text&gt;</code><br>
		<b>Example: </b> <code>sudo ReBrainer I didn't say this message!</code>
		<ul>
			<li><code>player: selector</code> - The player who will "say" this message.</li>
			<li><code>message: text</code> - The message the player will "say".</b></li>
		</ul>
		<br>
		<h2 id="toggletag">toggletag</h2>
		When ran, if the selected entity has the tag, it will be removed. If the entity doesn't have the tag, it will be added.<br>
		<b>Syntax: </b> <code>toggletag &lt;entity: selector&gt; &lt;tag: tag&gt;</code><br>
		<b>Example: </b> <code>toggletag @e[type=creeper] toggledTag</code>
		<ul>
			<li><code>entity: selector</code> - The entity who will acquire/lose the tag.</li>
			<li><code>tag: tag</code> - The tag that will be toggled.</b></li>
		</ul>
		<br>
		<h2 id="xpdisplay">xpdisplay</h2>
		Uses the XP bar to display numbers.<br>
		<b>Syntax: </b> <code>xpdisplay &lt;player: selector&gt; &lt;percentageFilled: int&gt; &lt;levelDisplay: int&gt;</code><br>
		<b>Example: </b> <code>xpdisplay ReBrainer 75 99</code>
		<ul>
			<li><code>player: selector</code> - The player whose XP bar will be modified.</li>
			<li><code>percentageFilled: int</code> - A number between 0 and 99 describing how full the XP bar should be. Due to Minecraft's nature, the amount will be less accurate depending on how many levels the player has (defined in the next argument).</b></li>
			<li><code>levelDisplay: int</code> - The number to show in the levels slot. Note that the accuracy of percentageFilled will drop when this number is lower.</b></li>
		</ul>
		<br><br><br><br>
	</div>
</template>