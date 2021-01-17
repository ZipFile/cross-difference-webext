const IsChrome = Object.getPrototypeOf(browser) !== Object.prototype;

browser.contextMenus.create({
    id: "cross-difference",
    title: "Show image cross-difference",
    contexts: ["image"],
});

function crossDiff(image) {
    const w = image.width, h = image.height;
    const size = w * h;
    const data = image.data;
    const grayscale = new ArrayBuffer(size);

    for (let i = 0; i < size; i++) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        grayscale[i] = r * 0.299 + g * 0.587 + b * 0.114;
    }

    for (let x = 0; x < (w - 1); x++) {
        for (let y = 0; y < (h - 1); y++) {
            const idx = (x + y * w) * 4;
            const value = Math.abs(
                grayscale[x + y*w] + grayscale[x + 1 + (y + 1) * w]
                - grayscale[x + 1 + y * w] - grayscale[x + (y + 1) * w]
            ) * 20;

            data[idx] = value;
            data[idx + 1] = value;
            data[idx + 2] = value;
            data[idx + 3] = 0xff;
        }
    }

    for (let x = 0; x < w; x++) {
        const idx = (x + (h - 1) * w) * 4;
        data[idx] = 0x00;
        data[idx + 1] = 0x00;
        data[idx + 2] = 0x00;
        data[idx + 3] = 0xff;
    }

    for (let y = 0; y < h; y++) {
        const idx = (w - 1 + y * w) * 4;
        data[idx] = 0x00;
        data[idx + 1] = 0x00;
        data[idx + 2] = 0x00;
        data[idx + 3] = 0xff;
    }
}

async function getCrossDifference(src, asBlob, offscreen) {
    const response = await fetch(src);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    let canvas;

    if (offscreen) {
        canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    } else {
        canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
    }

    const context = canvas.getContext("2d");

    context.drawImage(bitmap, 0, 0);

    const image = context.getImageData(0, 0, bitmap.width, bitmap.height);

    crossDiff(image);
    context.putImageData(image, 0, 0);

    if (asBlob) {
        if (offscreen) {
            return canvas.convertToBlob();
        }

        return new Promise(function(resolve) {
            canvas.toBlob(function(blob) {
                resolve(blob);
            });
        });
    }

    return canvas.toDataURL();
}

browser.contextMenus.onClicked.addListener(async function(info, tab) {
    const blob = await getCrossDifference(info.srcUrl, true, IsChrome);
    const url = URL.createObjectURL(blob);
    const createProperties = {
        openerTabId: tab.id,
        url: url,
    };

    if (IsChrome) {
        createProperties["index"] = tab.index + 1;
    }

    try {
        await browser.tabs.create(createProperties);
    } finally {
        URL.revokeObjectURL(url);
    }
});
