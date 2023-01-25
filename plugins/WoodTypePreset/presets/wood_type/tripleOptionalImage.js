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
    await quickBlockImage(PLANKS_TEXTURE, DEFAULT_PLANKS_TEXTURE, 'planks')
    // Log
    await quickBlockImage(LOG_TEXTURE, DEFAULT_LOG_TEXTURE, 'log')
    // Log Top
    await quickBlockImage(LOG_TEXTURE_TOP, DEFAULT_LOG_TEXTURE_TOP, 'log_top')
    // Stripped Log
    await quickBlockImage(STRIPPED_LOG_TEXTURE, DEFAULT_STRIPPED_LOG_TEXTURE, 'log_stripped')
    // Stripped Log Top
    await quickBlockImage(STRIPPED_LOG_TEXTURE_TOP, DEFAULT_STRIPPED_LOG_TEXTURE_TOP, 'log_top_stripped')
    // Leaves
    await quickBlockImage(LEAVES_TEXTURE, DEFAULT_LEAVES_TEXTURE, 'leaves', 'tga')
    // Trapdoor
    await quickBlockImage(TRAPDOOR_TEXTURE, DEFAULT_TRAPDOOR_TEXTURE, 'trapdoor')
    // Boat
    await quickEntityImage(BOAT_TEXTURE, DEFAULT_BOAT_TEXTURE, 'boat', 'boat')
    // Boat Item
    await quickItemImage(BOAT_ITEM_TEXTURE, DEFAULT_BOAT_ITEM_TEXTURE, 'boat')


    async function quickBlockImage(TEXTURE, DEFAULT_TEXTURE, str, ext = 'png') {
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

    async function quickItemImage(TEXTURE, DEFAULT_TEXTURE, str) {
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

    async function quickEntityImage(TEXTURE, DEFAULT_TEXTURE, str, path = '') {
        let fileName = `${IDENTIFIER}_${str}.png`

            if (!TEXTURE) TEXTURE = await loadPresetFile(DEFAULT_TEXTURE)
        else fileName = TEXTURE.name
        const fileNameNoExtension = fileName.replace(/.png|.tga|.jpg|.jpeg/gi, '')

            await createFile(`textures/entity/${PRESET_PATH}${path}/${IDENTIFIER}_${str}`, TEXTURE, { packPath: 'resourcePack' })
    }
}