const REPO_URL = `https://sbamboo.github.io/theaxolot77/storage/chibits/chibits.json`;

const THEAXO77PACK = /^The Axolot 77's pack v\.(\d+(?:\.\d+)*) \[([^\]]+)\](?: (ALPHA|BETA)-(\d+))?/i;
const THEAXO77ADDON = /^The Axolot 77's addon .+? v\.(\d+(?:\.\d+)*) \[([^\]]+)\](?: (ALPHA|BETA)-(\d+))?/i;
const THEAXO77ADDON_CROSSHAIR = /^The Axolot 77's addon .*crosshair.* v\.(\d+(?:\.\d+)*) \[([^\]]+)\](?: (ALPHA|BETA)-(\d+))?/i;

const outerWrapper = document.getElementById("chibit-downloads");

const mainProgressLoader = new ProgressLoader(outerWrapper);

function computeChecksum(data, algorithm) {
    if (algorithm === 'crc32') {
        let crc = 0 ^ (-1);
        for (let i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ crc32Table[(crc ^ data[i]) & 0xff];
        }
        return (crc ^ (-1)) >>> 0;
    } else {
        throw new Error(`Unsupported checksum algorithm: ${algorithm}`);
    }
}

const crc32Table = Array(256).fill(0).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    return c >>> 0;
});

function waitUntilThen(conditionFn, onConditionMet) {
    return new Promise(resolve => {
        function checkCondition() {
            if (conditionFn()) {
                onConditionMet();
                resolve();
            } else {
                setTimeout(checkCondition, 50);
            }
        }
        checkCondition();
    });
}

function layoutInlineProgress(bar) {
    bar.progressContainer.classList.add('chibit-chunk-progress');
    const track = document.createElement('div');
    track.className = 'chibit-chunk-track';
    bar.metaContainer.insertBefore(track, bar.percentageText);
    track.appendChild(bar.progressBar);
}

async function fetchChunk(chunkProgress, url, nr, signal) {
    const bar = chunkProgress.createProgressBar(`Chunk ${nr}`);
    layoutInlineProgress(bar._obj_);
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
        throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const total = parseInt(response.headers.get('content-length'), 10);
    let received = 0;
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) {
                        bar.cleanUp();
                        controller.close();
                        break;
                    }
                    received += value.length;
                    bar.update(received / total * 100);
                    controller.enqueue(value);
                }
            } catch (err) {
                controller.error(err);
            }
        },
        cancel() {
            reader.cancel();
        }
    });
    return new Response(stream);
}

async function assembleChibitDownloadBlob(container, data, downButton, cancelButton) {
    const chunkProgress = new ProgressLoader(container);

    cancelButton.style.display = "block";
    downButton.style.display = "none";

    const nameLabel = document.createElement('div');
    nameLabel.classList.add('chibit-download-name');
    nameLabel.innerText = data.filename;
    container.appendChild(nameLabel);

    const abort = new AbortController();
    let cancelled = false;
    cancelButton.onclick = () => {
        cancelled = true;
        abort.abort();
        cancelButton.style.display = "none";
        downButton.style.display = "block";
        nameLabel.remove();
        for (const bar of chunkProgress.progressBars) {
            bar.progressContainer.remove();
        }
    };

    let assembledData;
    try {
        if (data.chunks.length === 1) {
            const response = await fetchChunk(chunkProgress, data.chunks[0], 1, abort.signal);
            if (cancelled) return;
            assembledData = new Uint8Array(await response.arrayBuffer());
        } else {
            const chunkPromises = data.chunks.map((chunkUrl, index) =>
                fetchChunk(chunkProgress, chunkUrl, index + 1, abort.signal)
                    .then(res => res.arrayBuffer())
                    .catch(err => {
                        if (cancelled || err.name === 'AbortError') return null;
                        throw err;
                    })
            );

            const buffers = await Promise.all(chunkPromises);
            if (cancelled || buffers.some(buffer => buffer === null)) return;
            assembledData = new Uint8Array(buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0));
            let offset = 0;
            for (const buffer of buffers) {
                assembledData.set(new Uint8Array(buffer), offset);
                offset += buffer.byteLength;
            }
        }
    } catch (err) {
        nameLabel.remove();
        if (cancelled || err.name === 'AbortError') return;
        throw err;
    }

    nameLabel.remove();

    if (cancelled) return;

    if (assembledData.length !== data.size) {
        throw new Error(`Size mismatch. Expected: ${data.size}, Received: ${assembledData.length}`);
    }

    const calculatedChecksum = computeChecksum(assembledData, data.checksum.algorithm);
    if (calculatedChecksum !== data.checksum.hash) {
        throw new Error(`Checksum mismatch. Expected: ${data.checksum.hash}, Calculated: ${calculatedChecksum}`);
    }

    if (cancelled) return;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([assembledData]));
    a.download = data.filename;
    container.appendChild(a);
    a.click();
    container.removeChild(a);

    cancelButton.style.display = "none";
    downButton.style.display = "block";
}

async function assembleChibitDownload(container, stepsProgressBar, id, url) {
    const innerWrapper = document.createElement('div');
    innerWrapper.classList.add('chibit-entry');

    const response = await fetch(url);
    if (!response.ok) {
        console.error('Failed to fetch chibit entry:', response);
        return;
    }

    const data = await response.json();

    const button = document.createElement("button");
    button.innerText = data.filename;
    button.id = `for-${data.filename}-download`;
    button.classList.add("chibit-entry-button");

    const button2 = document.createElement("button");
    button2.innerText = "Cancel";
    button2.id = `for-${data.filename}-cancel`;
    button2.classList.add("chibit-cancel-button");
    button2.style.display = "none";
    innerWrapper.appendChild(button2);

    button.onclick = () => {
        assembleChibitDownloadBlob(innerWrapper, data, button, button2);
    };
    innerWrapper.appendChild(button);

    stepsProgressBar.progress(1);
    container.appendChild(innerWrapper);
}

function parseSemver(text) {
    return text.split('.').map(part => parseInt(part, 10));
}

function compareSemverDesc(a, b) {
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const av = a[i] || 0;
        const bv = b[i] || 0;
        if (av !== bv) return bv - av;
    }
    return 0;
}

function parseMcComponent(part) {
    const match = part.match(/^(\d+)(?:-(\d+))?(\+)?$/);
    if (!match || (match[2] && match[3])) return null;
    const start = parseInt(match[1], 10);
    const end = match[3] ? Infinity : (match[2] ? parseInt(match[2], 10) : start);
    if (end < start) return null;
    return { start, end };
}

function parseMcVersion(text) {
    const parts = text.split('.');
    if (parts.length > 3) return null;
    const comps = [];
    for (let i = 0; i < parts.length; i++) {
        const comp = parseMcComponent(parts[i]);
        if (!comp) return null;
        if (comp.end === Infinity && i !== parts.length - 1) return null;
        comps.push(comp);
    }
    const majorText = parts[0].match(/^(\d+)/)[1];
    const bare = parts.length === 1 && comps[0].end === comps[0].start;
    if (bare) return null;
    if (majorText === '1' || majorText.length === 2) return comps;
    return null;
}

function compareMcDesc(a, b) {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        const av = a[i] ? a[i].start : 0;
        const bv = b[i] ? b[i].start : 0;
        if (av !== bv) return bv - av;
    }
    for (let i = 0; i < length; i++) {
        const av = a[i] ? a[i].end : 0;
        const bv = b[i] ? b[i].end : 0;
        if (av !== bv) return bv > av ? 1 : -1;
    }
    return 0;
}

function findMcVersion(filename) {
    const brackets = /\[([^\]]+)\]/g;
    let match;
    while ((match = brackets.exec(filename)) !== null) {
        const parsed = parseMcVersion(match[1]);
        if (parsed) return parsed;
    }
    const token = /(?:^|[^.\d])(\d+(?:-\d+)?\+?(?:\.\d+(?:-\d+)?\+?)*)/g;
    while ((match = token.exec(filename)) !== null) {
        const start = match.index + match[0].length - match[1].length;
        if (filename.slice(Math.max(0, start - 2), start).toLowerCase() === 'v.') continue;
        const parsed = parseMcVersion(match[1]);
        if (parsed) return parsed;
    }
    return null;
}

function prereleaseTier(channel) {
    if (!channel) return 0;
    if (channel === 'BETA') return 1;
    return 2;
}

function comparePrerelease(a, b) {
    const at = prereleaseTier(a.channel);
    const bt = prereleaseTier(b.channel);
    if (at !== bt) return at - bt;
    if (a.preNum === null && b.preNum === null) return 0;
    if (a.preNum === null) return 1;
    if (b.preNum === null) return -1;
    return b.preNum - a.preNum;
}

function chibitSortKey(filename) {
    const pack = filename.match(THEAXO77PACK);
    if (pack) {
        return {
            group: 0,
            semver: parseSemver(pack[1]),
            mc: parseMcVersion(pack[2]),
            channel: pack[3] ? pack[3].toUpperCase() : null,
            preNum: pack[4] ? parseInt(pack[4], 10) : null,
        };
    }
    const addon = filename.match(THEAXO77ADDON);
    if (addon) {
        return {
            group: 1,
            semver: parseSemver(addon[1]),
            mc: parseMcVersion(addon[2]),
            channel: addon[3] ? addon[3].toUpperCase() : null,
            preNum: addon[4] ? parseInt(addon[4], 10) : null,
        };
    }
    const mc = findMcVersion(filename);
    if (mc) return { group: 2, semver: null, mc, channel: null, preNum: null };
    return { group: 3, semver: null, mc: null, channel: null, preNum: null };
}

function compareChibitFilenames(a, b) {
    const ak = chibitSortKey(a);
    const bk = chibitSortKey(b);
    if (ak.group !== bk.group) return ak.group - bk.group;
    if (ak.group <= 1) {
        const semverCmp = compareSemverDesc(ak.semver, bk.semver);
        if (semverCmp !== 0) return semverCmp;
        const mcCmp = compareMcDesc(ak.mc, bk.mc);
        if (mcCmp !== 0) return mcCmp;
        const preCmp = comparePrerelease(ak, bk);
        if (preCmp !== 0) return preCmp;
    } else if (ak.group === 2) {
        const mcCmp = compareMcDesc(ak.mc, bk.mc);
        if (mcCmp !== 0) return mcCmp;
    }
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

const CHIBIT_GROUP_LABELS = [
    'Axo77 Main Packs',
    'Axo77 Pack Addons',
    'Other',
];

function chibitLabelIndex(filename) {
    const group = chibitSortKey(filename).group;
    if (group >= 2) return 2;
    return group;
}

function labelChibitEntries(container) {
    let lastLabel = -1;
    for (const entry of Array.from(container.children)) {
        const button = entry.querySelector('.chibit-entry-button');
        if (!button) continue;
        const labelIndex = chibitLabelIndex(button.innerText);
        if (labelIndex === lastLabel) continue;
        lastLabel = labelIndex;
        const label = document.createElement('h3');
        label.classList.add('chibit-group-label');
        label.innerText = CHIBIT_GROUP_LABELS[labelIndex];
        container.insertBefore(label, entry);
    }
}

function groupCrosshairAddons(entries) {
    const crosshairs = entries.filter(entry =>
        THEAXO77ADDON_CROSSHAIR.test(entry.querySelector('.chibit-entry-button').innerText)
    );
    if (crosshairs.length < 2) return entries;
    const first = entries.indexOf(crosshairs[0]);
    const rest = entries.filter(entry => !crosshairs.includes(entry));
    rest.splice(first, 0, ...crosshairs);
    return rest;
}

function sortChibitEntries(container) {
    let entries = Array.from(container.children);
    entries.sort((a, b) => compareChibitFilenames(
        a.querySelector('.chibit-entry-button').innerText,
        b.querySelector('.chibit-entry-button').innerText
    ));
    entries = groupCrosshairAddons(entries);
    for (const entry of entries) {
        container.appendChild(entry);
    }
    if (!new URLSearchParams(location.search).has('nosortlabels')) {
        labelChibitEntries(container);
    }
}

function markLatestEntries(container) {
    const entries = Array.from(container.querySelectorAll('.chibit-entry')).map(entry => {
        const filename = entry.querySelector('.chibit-entry-button').innerText;
        return { entry, key: chibitSortKey(filename) };
    });
    let newest = null;
    for (const item of entries) {
        if (item.key.group > 2 || !item.key.mc) continue;
        if (!newest || compareMcDesc(item.key.mc, newest) < 0) newest = item.key.mc;
    }
    if (!newest) return;
    const marked = new Set();
    for (const item of entries) {
        if (item.key.group > 2 || !item.key.mc || marked.has(item.key.group)) continue;
        if (compareMcDesc(item.key.mc, newest) !== 0) continue;
        marked.add(item.key.group);
        const label = document.createElement('span');
        label.classList.add('chibit-latest');
        label.innerText = 'latest';
        item.entry.appendChild(label);
    }
}

async function assembleChibitDownloads() {
    const repoFetch = mainProgressLoader.fetch(REPO_URL, "Fetching chibit repo...");
    layoutInlineProgress(mainProgressLoader.progressBars[mainProgressLoader.progressBars.length - 1]);
    const response = await repoFetch;
    if (!response.ok) {
        console.error('Failed to fetch chibit repo:', response);
        return;
    }

    const data = await response.json();
    const maxlen = Object.keys(data).length;
    const stepsProgressBar = mainProgressLoader.createProgressBar(`Assembling ${maxlen} entries...`, true, 0, maxlen);
    layoutInlineProgress(stepsProgressBar._obj_);

    const container = document.createElement('div');
    for (const [id, url] of Object.entries(data)) {
        assembleChibitDownload(container, stepsProgressBar, id, url);
    }

    await waitUntilThen(
        () => stepsProgressBar._obj_.currentValue >= stepsProgressBar._obj_.end,
        () => {
            stepsProgressBar.cleanUp();
            if (!new URLSearchParams(location.search).has('nosort')) {
                sortChibitEntries(container);
            }
            markLatestEntries(container);
            outerWrapper.appendChild(container);
        }
    );
}

assembleChibitDownloads();
