const { create, SidebarContent } = await require("@bridge/sidebar")
const { Main, Header } = await require("@bridge/ui")
const { getDirectoryHandle, getFileHandle, writeJSON } = await require("@bridge/fs")
const { getCurrentProject, resolvePackPath } = await require("@bridge/env")
const { createError } = await require("@bridge/notification")
const { compileFiles } = await require("@bridge/project")

const icons = {
    "armor": "",
    "food": "",
    "minecoin": "",
    "token": "",
    "agent": "",
    "immersive_reader": "",
    "craft_toggle_on": "",
    "craft_toggle_off": "",

    "mobile_jump": "",
    "mobile_crouch": "",
    "mobile_fly_up": "",
    "mobile_fly_down": "",
    "mobile_left_arrow": "",
    "mobile_right_arrow": "",
    "mobile_up_arrow": "",
    "mobile_down_arrow": "",

    "pc_left_click": "",
    "pc_right_click": "",
    "pc_middle_click": "",

    "xbox_y": "",
    "xbox_b": "",
    "xbox_a": "",
    "xbox_x": "",
    "xbox_back": "",
    "xbox_start": "",
    "xbox_lb": "",
    "xbox_rb": "",
    "xbox_lt": "",
    "xbox_rt": "",
    "xbox_ls": "",
    "xbox_rs": "",
    "xbox_d_pad_up": "",
    "xbox_d_pad_right": "",
    "xbox_d_pad_down": "",
    "xbox_d_pad_left": "",

    "switch_x": "",
    "switch_a": "",
    "switch_b": "",
    "switch_y": "",
    "switch_+": "",
    "switch_-": "",
    "switch_l": "",
    "switch_r": "",
    "switch_zl": "",
    "switch_rl": "",
    "switch_l": "",
    "switch_r": "",
    "switch_d_pad_up": "",
    "switch_d_pad_right": "",
    "switch_d_pad_down": "",
    "switch_d_pad_left": "",

    "ps_triangle": "",
    "ps_circle": "",
    "ps_cross": "",
    "ps_square": "",
    "ps_options": "",
    "ps_touch_pad": "",
    "ps_l1": "",
    "ps_r1": "",
    "ps_l2": "",
    "ps_r2": "",
    "ps_l3": "",
    "ps_r3": "",
    "ps_d_pad_up": "",
    "ps_d_pad_right":"",
    "ps_d_pad_down": "",
    "ps_d_pad_left": ""
}

class MarkdownSidebar extends SidebarContent {
    component = Main;
    directoryHandle = null;
    docsPath = getCurrentProject() + "/docs";
    headerSlot = Header;

    isGenerating = false

    // Assigns each element with a seperate id. 
    elementIdCounter = 0;
    pageIdCounter = 0;
    categoryIdCounter = 0;

    // Json arrays
    sections = []
    buttons = [
        {
            "padding_0": {
                "type": "panel",
                "size": [
                    0,
                    6
                ]
            }
        }
    ]
    tips = [
        {
            "section_contents_header@how_to_play_common.section_contents_header": {}
        }
    ]

    constructor() {
        super()
        this.loadHandle();
        this.headerHeight = '60px';
    }

    async loadHandle() {
        this.directoryHandle = await getDirectoryHandle(this.docsPath, { create: true })
    }

    async compileDocs() {
        this.isGenerating = true
        const config = await this.LoadConfig();

        if (config === null) {
            this.isGenerating = false;
            return;
        }

        // Assigns each element with a seperate id. 
        this.elementIdCounter = 0;
        this.pageIdCounter = 0;
        this.categoryIdCounter = 0;

        // Json arrays
        this.sections = []
        this.buttons = [{ "padding_0": { "type": "panel", "size": [0, 6] } }]
        this.tips = [{ "section_contents_header@how_to_play_common.section_contents_header": {} }]

        for (var c = 0; c < config.categories.length; c++) {
            const title = config.categories[c].title || `Unnamed ${c}`
            const pages = config.categories[c].pages

            // Add category titles
            this.categoryIdCounter++;

            this.buttons.push({
                [`category_${this.categoryIdCounter}@how_to_play_common.topic_category`]: {
                    "$category": title
                }
            })

            // Parse each file
            for (var p = 0; p < pages?.length; p++) {
                await this.ParseFile(pages[p]);
            }
        }

        await this.SaveOutput();
        this.isGenerating = false;
    }

    async LoadConfig() {
        const configHandle = await getFileHandle(this.docsPath + "/config.json", { create: true })

        try {
            return JSON.parse(await (await configHandle.getFile()).text())
        }

        catch {
            createError(new Error("[Markdown Docs] docs/config.json could not be parsed. You may have invalid JSON."))
            return null
        }
    }

    async ParseFile(fileName) {
        const filePath = `${this.docsPath}/${fileName}.md`

        var fileHandle;
        var file;

        try {
            fileHandle = await getFileHandle(filePath)
            file = await (await fileHandle.getFile()).text()
        }

        catch {
            createError(new Error(`[Markdown Docs] ${filePath} could not be found!`))
            return;
        }

        var sectionName = "Unnamed"
        var yamlStartIdx = file.indexOf("---") + 3;
        var yamlEndIdx = file.lastIndexOf("---")

        var yaml = file.substring(yamlStartIdx, yamlEndIdx).replaceAll("\r", "").split("\n")

        yaml.forEach((line) => {
            if (yamlStartIdx == -1 || yamlEndIdx == -1) return;
            if (line == "") return;

            var key = line.split(": ")[0]
            var value = line.split(": ")[1]

            if (key == "name") sectionName = value;
        })

        var pageElements = []
        file = file.slice(yamlEndIdx + 3).trim()

        const fileContent = file.split("\n")

        fileContent.forEach((line) => {
            line = line.replace("\r", "");
            line = line + " "

            console.log(line)

            var isCodeBlock = new RegExp(/\`.*\`/m).test(line)

            var chars = line.split("")
            var lastChar = ""
            var lastLastChar = ""

            var isBoldItalic = false;
            var isBold = false;
            var isItalic = false;
            var isCode = false;
            var isEmoji = false;

            var emojiText = ""

            chars.forEach((char, index) => {
                // Code blocks
                if (char == "`") {
                    if (lastChar == "\\") {
                        chars[index - 1] = ""
                    }

                    else if (!isCode) {
                        chars[index] = ""
                        isCode = true
                    }

                    else {
                        chars[index] = ""
                        isCode = false
                    }
                }

                if (isCode) return;


                if (char == ":") {
                    if (!isEmoji) {
                        isEmoji = true;
                        chars[index] = ""
                        return;
                    }

                    else {
                        var icon = icons[emojiText] || `:${emojiText}:`
                        chars[index] = icon

                        isEmoji = false;
                        emojiText = ""
                    }
                }

                if (isEmoji) {
                    emojiText += char;
                    chars[index] = ""

                    return;
                }

                // Bold Italic text (***)
                if (char == "*" && lastChar == "*" && lastLastChar == "*") {
                    if (!isBoldItalic) {
                        chars[index] = "§l§o"
                        chars[index - 1] = ""
                        chars[index - 2] = ""
                        isBoldItalic = true
                    }

                    else {
                        chars[index] = "§r"
                        chars[index - 1] = ""
                        chars[index - 2] = ""
                        isBoldItalic = false
                    }
                }

                // Bold text (**)
                if (char == "*" && lastChar == "*" && lastLastChar != "*") {
                    if (!isBold) {
                        chars[index - 1] = ""
                        chars[index] = "§l"
                        isBold = true
                    }

                    else {
                        chars[index - 1] = ""
                        chars[index] = "§r"
                        isBold = false;
                    }
                }

                // Italic text (*)
                if (char != "*" && lastChar == "*" && lastLastChar != "*") {
                    if (!isItalic) {
                        chars[index - 1] = "§o"
                        isItalic = true
                    }

                    else {
                        chars[index - 1] = "§r"
                        isItalic = false
                    }
                }

                lastLastChar = lastChar;
                lastChar = char;
            })

            line = chars.join("");

            // Images
            if (line.match(/!\[.*\]\(.*\)/m) && !isCodeBlock) {
                var texturePath = line.split("(").pop().split(")")[0]
                var altText = line.split("[").pop().split("]")[0]

                pageElements.push({
                    [`image_${this.elementIdCounter}@how_to_play_common.image`]: {
                        "texture": texturePath
                    }
                })

                this.elementIdCounter++;

                if (altText != "") {
                    console.log("Alt text")
                    pageElements.push({
                        [`paragraph_${this.elementIdCounter}@how_to_play_common.paragraph`]: {
                            "$text": "§7§o" + altText,
                            "$text_alignment": "center"
                        }
                    })

                    this.elementIdCounter++;

                    pageElements.push({
                        [`padding_${this.elementIdCounter}@how_to_play_common.padding`]: {}
                    })
                    this.elementIdCounter++;
                }

                return;
            }

            // Padding
            if (line == "") {
                pageElements.push({
                    [`padding_${this.elementIdCounter}@how_to_play_common.padding`]: {}
                })
                this.elementIdCounter++;
                return;
            }

            // Headers
            if (line.startsWith("# ")) {
                line = line.replace("# ", "")
                pageElements.push({
                    [`header_${this.elementIdCounter}@how_to_play_common.header`]: {
                        "$text": line
                    }
                })
                this.elementIdCounter++;
                return;
            }

            // Paragraphs
            pageElements.push({
                [`paragraph_${this.elementIdCounter}@how_to_play_common.paragraph`]: {
                    "$text": line,
                    "$text_alignment": "left"
                }
            })
            this.elementIdCounter++;
        })

        this.sections.push({
            [`section_${this.pageIdCounter}_button@how_to_play_common.section_toggle_button`]: {
                "$section_topic": sectionName
            }
        })

        this.sections.push({
            [`section_${this.pageIdCounter}@how_to_play_common.main_sections`]: {
                "bindings": [
                    {
                        "binding_type": "view",
                        "source_control_name": `${sectionName}_button_toggle`,
                        "source_property_name": "#toggle_state",
                        "target_property_name": "#visible"
                    }
                ],
                "controls": pageElements
            }
        })

        this.buttons.push({
            [`section_${this.pageIdCounter}_button@how_to_play.section_${this.pageIdCounter}_button`]: {
                "$toggle_group_forced_index": this.pageIdCounter
            }
        })

        this.tips.push({
            [`section_${this.pageIdCounter}@how_to_play.section_${this.pageIdCounter}`]: {}
        })

        this.pageIdCounter++;
    }

    async SaveOutput() {
        var output = {
            "namespace": "how_to_play",
            "how_to_play_screen@how_to_play_common.screen_base": {
                "$selector_stack_panel": "how_to_play.selector_stack_panel",
                "$section_content_panels": "how_to_play.section_content_panels",
                "$header_safezone_control": "common_store.store_top_bar_filler",
                "$header_bar_control": "common_store.store_top_bar",
                "$is_full_screen_layout": true
            },
            "selector_stack_panel": {
                "type": "stack_panel",
                "anchor_from": "top_left",
                "anchor_to": "top_left",
                "orientation": "vertical",
                "$default_selector_toggle_index": 0,
                "controls": [
                    {
                        "how_to_play_selector_pane": {
                            "type": "stack_panel",
                            "controls": this.buttons
                        }
                    }
                ]
            },
            "section_content_panels": {
                "type": "stack_panel",
                "anchor_from": "top_left",
                "anchor_to": "top_left",
                "size": [
                    "100% - 5px",
                    "100%c + 5px"
                ],
                "offset": [
                    2,
                    0
                ],
                "controls": [
                    {
                        "general_tips_sections": {
                            "type": "stack_panel",
                            "controls": this.tips
                        }
                    }
                ]
            }
        }

        // Add json objects to output
        this.sections.forEach((section) => {
            Object.assign(output, section);
        })

        await writeJSON(await resolvePackPath('resourcePack', 'ui') + "/how_to_play_screen.json", output, true)
        await compileFiles([await resolvePackPath('resourcePack', 'ui') + "/how_to_play_screen.json"])
    }
}

const sidebar = create({
    id: 'frederox.markdown_docs',
    icon: 'mdi-book-open-outline',
    displayName: '[Markdown Docs]',
    sidebarContent: new MarkdownSidebar()
})
