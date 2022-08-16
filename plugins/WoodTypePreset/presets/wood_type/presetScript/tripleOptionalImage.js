module.exports = async ({ createFile, loadPresetFile, models, expandFile }) => {
    let {
        // Main Models
        IDENTIFIER,
        PRESET_PATH,
        // Default Textures
        DEFAULT_PLANKS_TEXTURE,
        DEFAULT_LOG_TEXTURE,
        DEFAULT_LOG_TEXTURE_TOP,
        DEFAULT_STRIPPED_LOG_TEXTURE,
        DEFAULT_STRIPPED_LOG_TEXTURE_TOP,
        DEFAULT_LEAVES_TEXTURE,
        DEFAULT_TRAPDOOR_TEXTURE,
        DEFAULT_BOAT_TEXTURE,
        DEFAULT_BOAT_ITEM_TEXTURE,
        // Imported Textures
        PLANKS_TEXTURE,
        LOG_TEXTURE,
        LOG_TEXTURE_TOP,
        STRIPPED_LOG_TEXTURE,
        STRIPPED_LOG_TEXTURE_TOP,
        LEAVES_TEXTURE,
        TRAPDOOR_TEXTURE,
        BOAT_TEXTURE,
        BOAT_ITEM_TEXTURE
    } = models

    // Planks
    quickBlockImage(PLANKS_TEXTURE, DEFAULT_PLANKS_TEXTURE, 'planks')
    // Log
    quickBlockImage(LOG_TEXTURE, DEFAULT_LOG_TEXTURE, 'log')
    // Log Top
    quickBlockImage(LOG_TEXTURE_TOP, DEFAULT_LOG_TEXTURE_TOP, 'log_top')
    // Stripped Log
    quickBlockImage(STRIPPED_LOG_TEXTURE, DEFAULT_STRIPPED_LOG_TEXTURE, 'log_stripped')
    // Stripped Log Top
    quickBlockImage(STRIPPED_LOG_TEXTURE_TOP, DEFAULT_STRIPPED_LOG_TEXTURE_TOP, 'log_top_stripped')
    // Leaves
    quickBlockImage(LEAVES_TEXTURE, DEFAULT_LEAVES_TEXTURE, 'leaves', 'tga')
    // Trapdoor
    quickBlockImage(TRAPDOOR_TEXTURE, DEFAULT_TRAPDOOR_TEXTURE, 'trapdoor')
    // Boat
    quickEntityImage(BOAT_TEXTURE, DEFAULT_BOAT_TEXTURE, 'boat', 'boat')
    // Boat Item
    quickItemImage(BOAT_ITEM_TEXTURE, DEFAULT_BOAT_ITEM_TEXTURE, 'boat')


    function quickBlockImage(TEXTURE, DEFAULT_TEXTURE, str, ext = 'png') {
        let fileName = `${IDENTIFIER}_${str}.${ext}`
        
            if (!TEXTURE) TEXTURE = await loadPresetFile(DEFAULT_TEXTURE)
        else fileName = TEXTURE.name
        const fileNameNoExtension = fileName.replace(/.png|.tga|.jpg|.jpeg/gi, '')

            await createFile(`textures/blocks/${PRESET_PATH}wood_types/${IDENTIFIER}/${fileName}`, TEXTURE, { packPath: 'resourcePack' })
        await expandFile('textures/terrain_texture.json', {
            texture_data: {
                [`${IDENTIFIER}_${str}`]: {
                    textures: `textures/blocks/${PRESET_PATH}wood_types/${IDENTIFIER}/${fileNameNoExtension}`
                }
            }
        }, { packPath: 'resourcePack' })
    }

    function quickItemImage(TEXTURE, DEFAULT_TEXTURE, str) {
        let fileName = `${IDENTIFIER}_${str}.png`

            if (!TEXTURE) TEXTURE = await loadPresetFile(DEFAULT_TEXTURE)
        else fileName = TEXTURE.name
        const fileNameNoExtension = fileName.replace(/.png|.tga|.jpg|.jpeg/gi, '')

            await createFile(`textures/items/${PRESET_PATH}wood_types/${IDENTIFIER}/${fileName}`, TEXTURE, { packPath: 'resourcePack' })
        await expandFile('textures/item_texture.json', {
            texture_data: {
                [`${IDENTIFIER}_${str}`]: {
                    textures: `textures/items/${PRESET_PATH}wood_types/${IDENTIFIER}/${fileNameNoExtension}`
                }
            }
        }, { packPath: 'resourcePack' })
    }

    function quickEntityImage(TEXTURE, DEFAULT_TEXTURE, str, path = '') {
        let fileName = `${IDENTIFIER}_${str}.png`

            if (!TEXTURE) TEXTURE = await loadPresetFile(DEFAULT_TEXTURE)
        else fileName = TEXTURE.name
        const fileNameNoExtension = fileName.replace(/.png|.tga|.jpg|.jpeg/gi, '')

            await createFile(`textures/entity/${PRESET_PATH}${path}/${IDENTIFIER}_${str}`)
    }
}