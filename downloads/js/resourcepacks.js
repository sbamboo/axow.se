const REPO_URL = `https://sbamboo.github.io/theaxolot77/storage/chibits/chibits.json`;

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

async function assembleChibitDownloadBlob(container, data, downButton, cancelButton) {
    const chunkProgress = new ProgressLoader(container);

    cancelButton.style.display = "block";
    downButton.style.display = "none";

    cancelButton.onclick = () => {
        cancelButton.style.display = "none";
        downButton.style.display = "block";
        chunkProgress.cleanUpAll();
    };

    let assembledData;
    if (data.chunks.length === 1) {
        const response = await chunkProgress.fetch(data.chunks[0], `Chunk 1 of ${data.filename}`);
        assembledData = new Uint8Array(await response.arrayBuffer());
    } else {
        const chunkPromises = data.chunks.map((chunkUrl, index) =>
            chunkProgress.fetch(chunkUrl, `Chunk ${index + 1} of ${data.filename}`).then(res => res.arrayBuffer())
        );
        
        const buffers = await Promise.all(chunkPromises);
        assembledData = new Uint8Array(buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0));
        let offset = 0;
        for (const buffer of buffers) {
            assembledData.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }
    }

    if (assembledData.length !== data.size) {
        throw new Error(`Size mismatch. Expected: ${data.size}, Received: ${assembledData.length}`);
    }

    const calculatedChecksum = computeChecksum(assembledData, data.checksum.algorithm);
    if (calculatedChecksum !== data.checksum.hash) {
        throw new Error(`Checksum mismatch. Expected: ${data.checksum.hash}, Calculated: ${calculatedChecksum}`);
    }

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

async function assembleChibitDownloads() {
    const response = await mainProgressLoader.fetch(REPO_URL, "Fetching chibit repo...");
    if (!response.ok) {
        console.error('Failed to fetch chibit repo:', response);
        return;
    }

    const data = await response.json();
    const maxlen = Object.keys(data).length;
    const stepsProgressBar = mainProgressLoader.createProgressBar(`Assembling ${maxlen} entries...`, true, 0, maxlen);

    const container = document.createElement('div');
    for (const [id, url] of Object.entries(data)) {
        assembleChibitDownload(container, stepsProgressBar, id, url);
    }

    await waitUntilThen(
        () => stepsProgressBar._obj_.currentValue >= stepsProgressBar._obj_.end,
        () => {
            stepsProgressBar.cleanUp();
            outerWrapper.appendChild(container);
        }
    );
}

assembleChibitDownloads();
