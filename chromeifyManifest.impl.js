export function chromeifyManifest(manifest) {
    delete manifest["browser_specific_settings"];

    return manifest;
}

export function parseArgs(args) {
    switch (args.length) {
    case 0:
        return ["-", "-"];
    case 1:
        return [args[0], "-"];
    default:
        return [args[0], args[1]];
    }
}

export function transformStream(instream, outstream) {
    const chunks = [];

    instream.on("data", (data) => chunks.push(data));
    instream.on("end", function() {
        const manifest = chromeifyManifest(JSON.parse(chunks.join("")));

        outstream.write(JSON.stringify(manifest, null, 4));
        outstream.end("\n");
    });
    instream.resume();
}
