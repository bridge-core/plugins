<template>
	<div style="padding:10px; overflow:scroll;">
		<h1>Coming Soon!</h1>
		<h1>Recipe Generator</h1>
		<div class="RecipeBackground">
			<img v-on:drop="del(event)" style="width:20px;"
				src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABQSURBVHja1NI7CgAgDATRvZze/0ZjK/jLEgsthhTCIwQFKJMA1VJn0TW8RwFFAdxmgIy4voGzBasj4sw3AQf5ADh97y1wagQyNQAAAP//AwD4kMB5C/Y1HAAAAABJRU5ErkJggg=="></img>
			<div class="ItemCells">
				<div v-for="(Slot, i) in this.Slots" class="ItemCell" v-bind:id="i" v-on:dragover="allowDrop(event)" v-on:drop="drop(event)">
					<img v-if="Slot.Id != undefined" v-bind:src="Slot.IMG" class="Item" v-bind:id="`${i}-${Slot.Id}`"
					v-on:dragstart="ondrag(event)" draggable="true"></img>
				</div>
			</div>
			<div class="Items">
				<v-btn class="ItemCell" icon v-for="Item in Items" @click="AddItem(Item)" v-bind:src="Item.IMG" style="width: 30px">
					<img v-bind:src="Item.IMG" style="width: 30px" draggable="false"></img>
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data: () => ({
		Items: [],
		Slots: [Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY, Items.EMPTY]
	}),
	async mounted() {
		this.Items = Object.values(Items);
		this.Items.splice(0, 1);
	},
	methods: {
		AddItem(Item) {
			for(let i = 0; i < this.Slots.length; i++)
			{
				if(this.Slots[i].Id == undefined)
				{
					this.Slots.splice(i, 1);
					this.Slots.splice(i, 0, Item);
					break;
				}
			}
		},
		allowDrop(ev) {
			ev.preventDefault();
		},
		ondrag(ev) {
			ev.dataTransfer.setData("text", ev.target.id);
		},
		drop(ev) {
			ev.preventDefault();
			var data = ev.dataTransfer.getData("text");
			var index = parseInt(data.charAt(0));
			swapElements(this.Slots, index, parseInt(ev.target.id));
		},
		del(ev) {
			var data = ev.dataTransfer.getData("text");
			var index = parseInt(data.charAt(0));
			this.Slots.splice(index, 1);
			this.Slots.splice(index, 0, Items.EMPTY);
		}
	}
}

function swapElements(arr, i1, i2) {
  arr[i1] = arr.splice(i2, 1, arr[i1])[0];
}

const Items = Object.freeze({
	EMPTY: {
		Id: undefined,
		IMG: undefined
	}
})
</script>

<style>
.RecipeBackground {
	margin: auto;
	border-style: solid;
	-o-border-image: url(dialog_background_opaque.png) 4;
	-webkit-border-image: url(dialog_background_opaque.png) 4;
	-moz-border-image: url(dialog_background_opaque.png) 4;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAklEQVR4AewaftIAAABzSURBVKXBQRHDMAxFwfdVcEFgPi0CIzACATEsVZ20k+RUZ7QrroI14kscIrFCEkmkB7tIrNq2jTHGE3gJiMTPnJN/eu98uDvGyZyTu4wio8goMoqMIqPIKDJu6r1zJnbRWuMud0ccorXGKncnSVwF60R6A/M7I8X3ISC0AAAAAElFTkSuQmCC") 7 fill;
	border-width: 18px 18px 18px 18px;
	image-rendering: pixelated;
	height: 300px;
	width: 500px;
}

.ItemCell {
	padding: 0;
	margin: 0;
	border-style: solid;
	-o-border-image: url(dialog_background_opaque.png) 6;
	-webkit-border-image: url(dialog_background_opaque.png) 6;
	-moz-border-image: url(dialog_background_opaque.png) 6;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAA7SURBVHjaYgwLDvvPQCYoKC5gYGFgYGDQ1NEkywBLS0sGJgYKwagBowaMGgAFx44d+08JAAAAAP//AwCbM0Ov7t4h/QAAAABJRU5ErkJggg==") 6 fill;
	border-width: 18px 18px 18px 18px;
	image-rendering: pixelated;
	height: 20px;
	width: 20px;
}

.ItemCells {
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 0;
	row-gap: 0;
	justify-content: center;
}

.Item {
	top: 0;
	left: 0;
	width: 30px;
	transform: translate(-15px,-15px);
}

.ItemCell:hover {
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADhJREFUOE9jDAsO+89AJigoLmBgBBlwRusIWUbcbXo6asBoGDCMpgMGKoXBsWPH/ltaWpKVG0GaAIa0WybCkMlcAAAAAElFTkSuQmCC") 6 fill;
}
</style>