import { create } from "@bridge/sidebar";
import { SideBar } from "@bridge/ui";
import { readdir } from "@bridge/fs";

create({
    id: "sinevector241.simpletools.sidebar",
    displayName: "Simple Tools",
    icon: "mdi-tools",
    component: SideBar
});

export class Test {
    async TestFunction() {

    }
}
readdir("").then(val => { console.log(val); });