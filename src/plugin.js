const {plugin, logger, resourcesPath} = require("@eniac/flexdesigner")
const {createCanvas, GlobalFonts, loadImage} = require('@napi-rs/canvas');
const WebSocket = require('isomorphic-ws');
const {join} = require('path')

let bars = new Map();
let inventoryState = Array.from({length: 41});

GlobalFonts.registerFromPath(join(resourcesPath, 'MinecraftRegular-Bmg3.otf'), 'Apple Emoji')

const ws = new WebSocket("ws://localhost:28887");

ws.onopen = () => console.log("connected!");
ws.onmessage = (e) => {
    // update inventoryState
    JSON.parse(e.data).items.forEach(item => {
        inventoryState[item.slot] = {
            name: item.name,
            id: item.id,
            count: item.count,
        };
    });

    Array.from(bars.entries()).forEach(([serialNumber, bar]) => bar.keys.forEach(key => {
        generateInventory(key.width, inventoryState, key).then(bg =>
            plugin.draw(serialNumber, key, 'base64', bg)
        );
    }));
};
ws.onclose = () => {
    inventoryState = Array.from({length: 41});
};


/**
 * Called when a plugin key is loaded
 * @param {Object} payload alive key data
 * {
 *  serialNumber: '',
 *  keys: [
 *  {
 *      "data": {},
 *      "cid": "com.eniac.example.wheel",
 *      "bg": 0,
 *      "width": 360,
 *      "pluginID": "com.eniac.example",
 *      "typeOverride": "plugin",
 *      "wheel": {
 *      "step": 5
 *      },
 *      "cfg": {
 *      "keyType": "wheel",
 *      "sendKey": true
 *      },
 *      "uid": 0,
 *      "sz": 2309
 *  }
 *  ]
 * }
 */
plugin.on('plugin.alive', (payload) => {
    logger.info('Plugin alive');
    const data = payload.keys
    const serialNumber = payload.serialNumber;
    const bar = { keys: [] };
    bars.set(serialNumber, bar)
    for (let key of data) {
        if (key.cid === 'land.sams.mc-connect.inventory' || key.cid === 'land.sams.mc-connect.armour') {
            bar.keys.push(key)
            generateInventory(key.width, inventoryState, key).then(bg => {
                plugin.draw(serialNumber, key, 'base64', bg)
            });

        }
    }
})


/**
 * Called when user interacts with a key
 * @param {object} payload key data
 * {
 *  serialNumber,
 *  data
 * }
 */
plugin.on('plugin.data', (payload) => {
    const data = payload.data
    const key = data.key;
    if (key.cid === 'land.sams.mc-connect.inventory') {
        ws.send(JSON.stringify({slot: key.data.slot}));
    }
})

plugin.start()

/**
 * @param {number} width - The width of the canvas.
 * @param {Array<{ name: string; count: number; img: string; id: string }>} inventory
 * @param {{ data: { slot?: number }, cid: string }} key
 * @return {Promise<string>} The PNG base64 string with MIME type.
 */
async function generateInventory(width, inventory, key) {
    const slot = key.data.slot;

    const height = 60;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (key.cid === 'land.sams.mc-connect.inventory') {
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, 63, height);

        ctx.fillStyle = '#676767';
        ctx.fillRect(3, 3, 60 - 3, height - 6);

        ctx.fillStyle = '#919191';
        ctx.fillRect(5, 5, 60 - 5, height - 8);


        await drawItem(ctx, inventory[slot]);
    }
    if (key.cid === 'land.sams.mc-connect.armour') await drawArmour(ctx, inventory[36], inventory[37], inventory[38], inventory[39])

    return canvas.toDataURL('image/png');
}


async function drawItem(ctx, item) {
    if (!item) return;
    if (item.count === 0) return;

    await draw(ctx, item, 4, 4, 54, 54);

    if (item.count === 1) return;

    ctx.font = '30px Minecraft';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';


    ctx.fillStyle = '#333333';
    ctx.fillText(item.count.toString(), 64, 51);

    ctx.fillStyle = 'white';
    ctx.fillText(item.count.toString(), 61, 48);
}

async function drawArmour(ctx, boots, leggings, chestplate, helmet) {
    return await Promise.all([
        draw(ctx, boots, 22, 41, 16, 16),
        draw(ctx, leggings, 22, 29, 16, 16),
        draw(ctx, chestplate, 22, 15, 16, 16),
        draw(ctx, helmet, 22, 4, 16, 16),
    ]);
}

async function draw(ctx, item, x, y, width, height) {
    if (!item?.id) return;
    const imagePath = join(resourcesPath, 'assets', `${item.id.split('.').at(-1).toUpperCase()}.png`)
    const image = await loadImage(imagePath);

    ctx.drawImage(image, x, y, width, height);
}