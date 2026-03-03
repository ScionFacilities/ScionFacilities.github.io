document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const labelTypeSelect = document.getElementById('labelType');
    const urlInput = document.getElementById('url');
    const assetNameInput = document.getElementById('assetName');
    const dateCreatedInput = document.getElementById('dateCreated');
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const labelPreview = document.getElementById('labelPreview');
    const maintainxHelp = document.getElementById('maintainxHelp');
    const githubHelp = document.getElementById('githubHelp');

    // Bulk mode DOM elements
    const tabSingle = document.getElementById('tabSingle');
    const tabBulk = document.getElementById('tabBulk');
    const singleMode = document.getElementById('singleMode');
    const bulkMode = document.getElementById('bulkMode');
    const singlePreviewContainer = document.getElementById('singlePreviewContainer');
    const bulkPreviewContainer = document.getElementById('bulkPreviewContainer');
    const csvFileInput = document.getElementById('csvFile');
    const csvMapping = document.getElementById('csvMapping');
    const colNameSelect = document.getElementById('colName');
    const colUrlSelect = document.getElementById('colUrl');
    const bulkDateInput = document.getElementById('bulkDate');
    const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');
    const bulkPrintBtn = document.getElementById('bulkPrintBtn');
    const bulkLabelList = document.getElementById('bulkLabelList');
    const bulkCount = document.getElementById('bulkCount');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const selectNoneBtn = document.getElementById('selectNoneBtn');

    // Bulk state
    let csvRows = [];
    let csvHeaders = [];

    // Set default date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateCreatedInput.value = `${year}-${month}-${day}`;
    bulkDateInput.value = `${year}-${month}-${day}`;

    // Tab switching
    tabSingle.addEventListener('click', function() {
        tabSingle.classList.add('active');
        tabBulk.classList.remove('active');
        singleMode.style.display = '';
        bulkMode.style.display = 'none';
        singlePreviewContainer.style.display = '';
        bulkPreviewContainer.style.display = 'none';
    });

    tabBulk.addEventListener('click', function() {
        tabBulk.classList.add('active');
        tabSingle.classList.remove('active');
        singleMode.style.display = 'none';
        bulkMode.style.display = '';
        singlePreviewContainer.style.display = 'none';
        bulkPreviewContainer.style.display = csvRows.length > 0 ? '' : 'none';
    });
    
    // ── CSV upload & parsing ──────────────────────────────────────────────────

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
        if (lines.length === 0) return { headers: [], rows: [] };
        const headers = splitCSVLine(lines[0]);
        const rows = lines.slice(1).map(l => {
            const vals = splitCSVLine(l);
            const obj = {};
            headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
            return obj;
        }).filter(r => Object.values(r).some(v => v !== ''));
        return { headers, rows };
    }

    function splitCSVLine(line) {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
                else { inQuotes = !inQuotes; }
            } else if (ch === ',' && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        result.push(cur.trim());
        return result;
    }

    function populateColumnSelects(headers) {
        colNameSelect.innerHTML = '';
        colUrlSelect.innerHTML = '';
        headers.forEach(h => {
            const o1 = document.createElement('option');
            o1.value = h; o1.textContent = h;
            colNameSelect.appendChild(o1);
            const o2 = document.createElement('option');
            o2.value = h; o2.textContent = h;
            colUrlSelect.appendChild(o2);
        });
        // Auto-select best matches
        const nameCandidates = ['name', 'asset name', 'asset_name', 'title'];
        const urlCandidates  = ['url', 'asset url', 'asset_url', 'link', 'qr url', 'qr_url'];
        const findMatch = (candidates) => {
            for (const c of candidates) {
                const h = headers.find(h => h.toLowerCase() === c);
                if (h) return h;
            }
            for (const c of candidates) {
                const h = headers.find(h => h.toLowerCase().includes(c));
                if (h) return h;
            }
            return null;
        };
        const nameMatch = findMatch(nameCandidates);
        const urlMatch  = findMatch(urlCandidates);
        if (nameMatch) colNameSelect.value = nameMatch;
        if (urlMatch)  colUrlSelect.value  = urlMatch;
    }

    const csvDropZone  = document.getElementById('csvDropZone');
    const csvBrowseBtn = document.getElementById('csvBrowseBtn');
    const csvFileName  = document.getElementById('csvFileName');

    function handleCSVFile(file) {
        if (!file || !file.name.toLowerCase().endsWith('.csv')) {
            alert('Please select a CSV file.');
            return;
        }
        csvFileName.textContent = file.name;
        csvFileName.classList.add('has-file');
        const reader = new FileReader();
        reader.onload = function(e) {
            const parsed = parseCSV(e.target.result);
            if (parsed.headers.length === 0) {
                alert('Could not read any columns from the CSV file.');
                return;
            }
            csvHeaders = parsed.headers;
            csvRows    = parsed.rows;
            populateColumnSelects(csvHeaders);
            csvMapping.style.display = '';
            bulkGenerateBtn.disabled = false;
        };
        reader.readAsText(file);
    }

    csvBrowseBtn.addEventListener('click', function() {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', function() {
        if (csvFileInput.files[0]) handleCSVFile(csvFileInput.files[0]);
    });

    csvDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        csvDropZone.classList.add('drag-over');
    });

    csvDropZone.addEventListener('dragleave', function(e) {
        if (!csvDropZone.contains(e.relatedTarget)) {
            csvDropZone.classList.remove('drag-over');
        }
    });

    csvDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        csvDropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleCSVFile(file);
    });

    // ── Bulk generate ─────────────────────────────────────────────────────────

    bulkGenerateBtn.addEventListener('click', function() {
        const nameCol = colNameSelect.value;
        const urlCol  = colUrlSelect.value;
        const date    = bulkDateInput.value;
        const labelType = labelTypeSelect.value;

        if (!date) { alert('Please select a Date Created.'); return; }

        const items = csvRows
            .map(r => ({ name: r[nameCol], url: r[urlCol] }))
            .filter(item => item.name && item.url);

        if (items.length === 0) {
            alert('No valid rows found. Check your column selections.');
            return;
        }

        bulkLabelList.innerHTML = '';
        bulkCount.textContent = `(${items.length})`;

        items.forEach((item, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bulk-label-item';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.id = `bulk-cb-${idx}`;
            cb.dataset.idx = idx;

            const info = document.createElement('div');
            info.className = 'bulk-label-info';

            const nameEl = document.createElement('div');
            nameEl.className = 'bulk-label-name';
            nameEl.textContent = item.name;

            const urlEl = document.createElement('div');
            urlEl.className = 'bulk-label-url';
            urlEl.textContent = item.url;

            info.appendChild(nameEl);
            info.appendChild(urlEl);

            const previewWrap = document.createElement('div');
            previewWrap.className = 'bulk-label-preview-wrap';

            wrapper.appendChild(cb);
            wrapper.appendChild(info);
            wrapper.appendChild(previewWrap);
            bulkLabelList.appendChild(wrapper);

            // Render a small label preview inside previewWrap
            generateLabelInto(previewWrap, item.url, item.name, date, labelType, true);
        });

        // Store items for print use
        bulkLabelList.dataset.date = date;
        bulkLabelList.dataset.labelType = labelType;

        bulkPreviewContainer.style.display = '';
        bulkPrintBtn.disabled = false;
    });

    // ── Select All / None ─────────────────────────────────────────────────────

    selectAllBtn.addEventListener('click', function() {
        bulkLabelList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });

    selectNoneBtn.addEventListener('click', function() {
        bulkLabelList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    // ── Bulk print ────────────────────────────────────────────────────────────

    bulkPrintBtn.addEventListener('click', function() {
        const date      = bulkLabelList.dataset.date;
        const labelType = bulkLabelList.dataset.labelType;
        const items     = [];

        bulkLabelList.querySelectorAll('.bulk-label-item').forEach(wrapper => {
            const cb = wrapper.querySelector('input[type="checkbox"]');
            if (!cb || !cb.checked) return;
            const name = wrapper.querySelector('.bulk-label-name').textContent;
            const url  = wrapper.querySelector('.bulk-label-url').textContent;
            items.push({ name, url });
        });

        if (items.length === 0) {
            alert('No labels selected. Please select at least one label to print.');
            return;
        }

        printBulkLabels(items, date, labelType);
    });

    // ── Bulk print window ─────────────────────────────────────────────────────

    function printBulkLabels(items, dateCreated, labelType) {
        const printWindow = window.open('', '_blank');

        const labelCSS = getBulkLabelCSS();
        const labelsHTML = items.map(item =>
            buildLabelHTML(item.url, item.name, dateCreated, labelType)
        ).join('\n');

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Print Asset Labels</title>
<style>
${labelCSS}
</style>
</head>
<body>
${labelsHTML}
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
<script>
var printInitiated = false;

function generateAllQR() {
    var containers = document.querySelectorAll('.qr-container[data-url]');
    containers.forEach(function(container) {
        var url = container.getAttribute('data-url');
        var lt  = container.getAttribute('data-type');
        var qr  = qrcode(0, 'H');
        qr.addData(url);
        qr.make();
        container.innerHTML = qr.createImgTag(4, 0);
        var qrImg = container.querySelector('img');
        if (qrImg) {
            qrImg.style.width  = '100%';
            qrImg.style.height = '100%';
            qrImg.style.display = 'block';
            qrImg.style.objectFit = 'fill';
            var logo = document.createElement('img');
            logo.src = 'images/' + (lt === 'maintainx' ? 'X.png' : 'G.png');
            logo.className = 'center-logo';
            qrContainer_addWhiteCenter(container, qrImg, logo);
        }
    });
}

function qrContainer_addWhiteCenter(container, qrImg, logo) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    function process() {
        var w = qrImg.naturalWidth || qrImg.width;
        var h = qrImg.naturalHeight || qrImg.height;
        if (!w || !h) { setTimeout(process, 50); return; }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(qrImg, 0, 0, w, h);
        var sz = Math.min(w, h) * 0.25;
        ctx.fillStyle = 'white';
        ctx.fillRect((w - sz) / 2, (h - sz) / 2, sz, sz);
        var newImg = new Image();
        newImg.src = canvas.toDataURL('image/png');
        newImg.style.width = '100%';
        newImg.style.height = '100%';
        newImg.style.display = 'block';
        newImg.style.objectFit = 'fill';
        qrImg.replaceWith(newImg);
        container.appendChild(logo);
    }
    if (qrImg.complete && qrImg.naturalWidth) { process(); }
    else { qrImg.onload = process; }
}

function adjustWrapAll() {
    document.querySelectorAll('.print-label').forEach(function(label) {
        var nameEl  = label.querySelector('.asset-name');
        var titleEl = label.querySelector('.asset-title');
        var dateEl  = label.querySelector('.date-created');
        var bsiEl   = label.querySelector('.bsi-logo');
        if (!nameEl) return;
        var lh = parseFloat(window.getComputedStyle(nameEl).lineHeight) ||
                 parseFloat(window.getComputedStyle(nameEl).fontSize) * 1.2;
        if (nameEl.offsetHeight > lh * 1.5) {
            nameEl.style.fontSize  = '12px';
            if (titleEl) titleEl.style.fontSize = '11px';
            if (dateEl)  dateEl.style.fontSize  = '10px';
            if (bsiEl)   bsiEl.style.width      = '25mm';
        }
    });
}

window.onload = function() {
    generateAllQR();
    adjustWrapAll();
    setTimeout(function() {
        if (!printInitiated) {
            printInitiated = true;
            window.print();
            window.addEventListener('afterprint', function() { window.close(); });
            setTimeout(function() { window.close(); }, 1000);
        }
    }, 900);
};

window.addEventListener('focus', function() {
    if (printInitiated) { setTimeout(function() { window.close(); }, 300); }
});
<\/script>
</body>
</html>`);
        printWindow.document.close();
    }

    function buildLabelHTML(url, assetName, dateCreated, labelType) {
        const title = labelType === 'maintainx' ? 'MaintainX Asset' : 'GitHub Docs';
        const bottomLogoSrc = labelType === 'maintainx' ? 'images/MaintainX.png' : 'images/Github.png';
        const bottomLogoAlt = labelType === 'maintainx' ? 'MaintainX Logo' : 'GitHub Logo';
        const bottomLogoClass = labelType === 'maintainx' ? 'maintainx-logo' : 'github-logo';
        const formattedDate = formatDate(dateCreated);
        const escapedName = assetName.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        const escapedUrl  = url.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        return `<div class="print-label">
  <div class="left-side">
    <div class="qr-container" data-url="${escapedUrl}" data-type="${labelType}"></div>
    <img class="${bottomLogoClass}" src="${bottomLogoSrc}" alt="${bottomLogoAlt}">
  </div>
  <div class="right-side">
    <div>
      <div class="asset-title">${title}</div>
      <div class="asset-name">${escapedName}</div>
      <div class="date-created">Date Created: ${formattedDate}</div>
    </div>
    <img class="bsi-logo" src="images/BSILogo.svg" alt="BSI Logo">
  </div>
</div>`;
    }

    function getBulkLabelCSS() {
        return `
@page { size: 90mm 38mm; margin: 0; }
* { box-sizing: border-box; }
body, html {
    margin: 0; padding: 0;
    font-family: Arial, sans-serif;
    background: white;
}
.print-label {
    width: 90mm;
    height: 38mm;
    display: flex;
    background-color: white;
    page-break-after: always;
    overflow: hidden;
}
.print-label:last-child { page-break-after: avoid; }
.left-side {
    width: 38mm;
    height: 38mm;
    position: relative;
    overflow: visible;
    flex-shrink: 0;
}
.right-side {
    flex: 1;
    padding: 5mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}
.qr-container {
    width: 30mm;
    height: 28mm;
    margin: 3mm 4mm 0 4mm;
    position: relative;
}
.qr-container img:not(.center-logo) {
    width: 100%; height: 100%;
    display: block; object-fit: fill;
}
.center-logo {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 6mm;
    z-index: 10;
}
.maintainx-logo {
    position: absolute;
    bottom: 2mm; width: 23mm;
    left: 50%;
    transform: translateX(-50%);
}
.github-logo {
    position: absolute;
    bottom: 0mm; width: 23mm;
    left: 50%;
    transform: translateX(-50%);
}
.asset-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 2mm;
}
.asset-name {
    font-size: 16px;
    margin-bottom: 2mm;
    word-break: break-word;
}
.date-created {
    font-size: 12px;
    color: #444;
    font-weight: bold;
    margin-bottom: 4mm;
}
.bsi-logo {
    width: 33mm;
    align-self: flex-start;
    margin-top: auto;
}
@media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;
    }

    // ── Preload images
    const xLogo = new Image();
    xLogo.src = 'images/X.png';
    
    const gLogo = new Image();
    gLogo.src = 'images/G.png';
    
    const maintainxLogo = new Image();
    maintainxLogo.src = 'images/MaintainX.png';
    
    const githubLogo = new Image();
    githubLogo.src = 'images/Github.png';
    
    const bsiLogo = new Image();
    bsiLogo.src = 'images/BSILogo.svg';
    
    // Handle label type change
    labelTypeSelect.addEventListener('change', function() {
        const selectedType = labelTypeSelect.value;
        if (selectedType === 'maintainx') {
            maintainxHelp.style.display = 'block';
            githubHelp.style.display = 'none';
            urlInput.placeholder = 'Enter asset URL';
            assetNameInput.placeholder = 'Enter asset name';
        } else {
            maintainxHelp.style.display = 'none';
            githubHelp.style.display = 'block';
            urlInput.placeholder = 'Enter GitHub repository URL';
            assetNameInput.placeholder = 'Enter repository name';
        }
    });
    
    // Generate label when button is clicked
    generateBtn.addEventListener('click', function() {
        // Validate inputs
        const labelType = labelTypeSelect.value;
        const url = urlInput.value.trim();
        const assetName = assetNameInput.value.trim();
        const dateCreated = dateCreatedInput.value;
        
        if (!url || !assetName || !dateCreated) {
            alert('Please enter URL, Asset Name, and Date Created');
            return;
        }
        
        // Disable the print button initially (it will be enabled after generation)
        printBtn.disabled = true;
        
        generateLabel(url, assetName, dateCreated, labelType);
        printBtn.disabled = false;
    });
    
    // Handle print button
    printBtn.addEventListener('click', function() {
        // Get current form values for reproduction in print window
        const labelType = labelTypeSelect.value;
        const url = urlInput.value.trim();
        const assetName = assetNameInput.value.trim();
        const dateCreated = dateCreatedInput.value;
        
        if (!url || !assetName || !dateCreated) {
            alert('Please fill in all fields before printing');
            return;
        }
        
        // Create a new print-specific window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Asset Label</title>
            <style>
                @page {
                    size: 90mm 38mm;
                    margin: 0;
                }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        overflow: hidden;
                    }
                    /* Optimize label for printing */
                    .print-label {
                        width: 72mm; /* 90mm ÷ 1.25 to compensate for scaling */
                        height: 30.4mm; /* 38mm ÷ 1.25 to compensate for scaling */
                        transform: scale(1.25);
                        transform-origin: center;
                        position: absolute;
                        top: 3mm;
                        left: 15mm; /* Increased from 9mm to add more padding on the left */
                        box-shadow: none;
                        border: none;
                    }
                    /* Optimize components for printing */
                    .left-side {
                        width: 32mm; /* Adjusted for better proportion */
                    }
                    .qr-container {
                        width: 28mm; /* Slightly smaller for better balance */
                        height: 26mm;
                    }
                    .maintainx-logo {
                        width: 22mm; /* Slightly smaller */
                    }
                }
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 90mm;
                    height: 38mm;
                    overflow: hidden;
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .print-label {
                    width: 90mm;
                    height: 38mm;
                    display: flex;
                    background-color: white;
                    box-sizing: border-box;
                }
                .left-side {
                    width: 38mm;
                    height: 38mm;
                    position: relative;
                    overflow: visible;
                }
                .right-side {
                    flex: 1;
                    padding: 5mm;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .qr-container {
                    width: 30mm;
                    height: 28mm;
                    margin: 3mm 4mm 0 4mm;
                    position: relative;
                }
                .qr-code {
                    width: 100%;
                    height: 100%;
                }
                .x-logo, .center-logo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 6mm;
                    z-index: 10;
                }
                /* Specific styling for each logo type */
                .maintainx-logo {
                    position: absolute;
                    bottom: 2mm;
                    width: 23mm;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 0;
                }
                
                .github-logo {
                    position: absolute;
                    bottom: 0mm;
                    width: 23mm;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 1mm;
                }
                .asset-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 2mm;
                }
                .asset-name {
                    font-size: 16px;
                    margin-bottom: 2mm;
                    word-break: break-word;
                }
                .date-created {
                    font-size: 12px;
                    color: #444;
                    font-weight: bold;
                    margin-bottom: 4mm;
                }
                .bsi-logo {
                    width: 33mm;
                    align-self: flex-start;
                    margin-top: auto;
                }
            </style>
        </head>
        <body>
            <div class="print-label">
                <div class="left-side">
                    <div class="qr-container" id="qrContainer"></div>
                    <img class="${labelType === 'maintainx' ? 'maintainx-logo' : 'github-logo'}" src="images/${labelType === 'maintainx' ? 'MaintainX.png' : 'Github.png'}" alt="${labelType === 'maintainx' ? 'MaintainX' : 'GitHub'} Logo">
                </div>
                <div class="right-side">
                    <div>
                        <div class="asset-title">${labelType === 'maintainx' ? 'MaintainX Asset' : 'GitHub Docs'}</div>
                        <div class="asset-name">${assetName}</div>
                        <div class="date-created">Date Created: ${formatDate(dateCreated)}</div>
                    </div>
                    <img class="bsi-logo" src="images/BSILogo.svg" alt="BSI Logo">
                </div>
            </div>
            
            <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
            <script>
                let printInitiated = false;
                
                function generateQRWithLogo() {
                    const qr = qrcode(0, 'H');
                    qr.addData('${url}');
                    qr.make();
                    
                    const qrContainer = document.getElementById('qrContainer');
                    qrContainer.innerHTML = qr.createImgTag(4, 0);
                    
                    const qrImg = qrContainer.querySelector('img');
                    if (qrImg) {
                        // Ensure QR code fills its container
                        qrImg.style.width = '100%';
                        qrImg.style.height = '100%';
                        qrImg.style.display = 'block';
                        qrImg.style.objectFit = 'fill';
                        
                        // Add the logo in the center of the QR code
                        const logo = document.createElement('img');
                        logo.src = 'images/${labelType === 'maintainx' ? 'X.png' : 'G.png'}';
                        logo.className = 'center-logo';
                        logo.style.width = '6mm';
                        logo.style.position = 'absolute';
                        logo.style.top = '50%';
                        logo.style.left = '50%';
                        logo.style.transform = 'translate(-50%, -50%)';
                        logo.style.zIndex = '10';
                        qrContainer.appendChild(logo);
                        
                        // Create canvas to modify QR code
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        qrImg.onload = function() {
                            const width = qrImg.width;
                            const height = qrImg.height;
                            canvas.width = width;
                            canvas.height = height;
                            
                            // Draw QR code to canvas
                            ctx.drawImage(qrImg, 0, 0, width, height);
                            
                            // Create a white square in the center
                            const centerSize = Math.min(width, height) * 0.25;
                            const x = (width - centerSize) / 2;
                            const y = (height - centerSize) / 2;
                            
                            ctx.fillStyle = 'white';
                            ctx.fillRect(x, y, centerSize, centerSize);
                            
                            // Replace the QR code image with the modified version
                            const newImg = new Image();
                            newImg.src = canvas.toDataURL('image/png');
                            newImg.style.width = qrImg.style.width;
                            newImg.style.height = qrImg.style.height;
                            qrImg.replaceWith(newImg);
                        };
                    }
                };
                //     }
                // };
                // document.body.appendChild(printButton);
                
                // Setup one-time printing when all content is loaded
                window.onload = function() {
                    generateQRWithLogo();
                    
                    // Detect text wrapping and adjust sizes if needed
                    (function() {
                        var nameEl = document.querySelector('.asset-name');
                        var titleEl = document.querySelector('.asset-title');
                        var dateEl = document.querySelector('.date-created');
                        var bsiEl = document.querySelector('.bsi-logo');
                        if (nameEl) {
                            var lineHeight = parseFloat(window.getComputedStyle(nameEl).lineHeight) || (parseFloat(window.getComputedStyle(nameEl).fontSize) * 1.2);
                            if (nameEl.offsetHeight > lineHeight * 1.5) {
                                nameEl.style.fontSize = '12px';
                                if (titleEl) titleEl.style.fontSize = '11px';
                                if (dateEl) dateEl.style.fontSize = '10px';
                                if (bsiEl) bsiEl.style.width = '25mm';
                            }
                        }
                    })();
                    
                // Give time for images to load fully before printing
                    setTimeout(function() {
                        if (!printInitiated) {
                            printInitiated = true;
                            window.print();
                            
                            // Add event listener for afterprint to close the window
                            window.addEventListener('afterprint', function() {
                                window.close();
                            });
                            
                            // Backup close in case afterprint doesn't fire
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }
                    }, 800);
                };
                
                // Handle when user cancels the print dialog
                window.addEventListener('focus', function() {
                    // If we've initiated printing and the window gets focus back (dialog closed)
                    if (printInitiated) {
                        setTimeout(function() {
                            window.close();
                        }, 300);
                    }
                });
            </script>
        </body>
        </html>
        `);
        printWindow.document.close();
    });
    
    // Generate and display the label (single mode)
    function generateLabel(url, assetName, dateCreated, labelType = 'maintainx') {
        labelPreview.innerHTML = '';
        generateLabelInto(labelPreview, url, assetName, dateCreated, labelType, false);
    }

    // Core label builder — renders into any target container
    // miniPreview=true scales the label down for the bulk list
    function generateLabelInto(targetContainer, url, assetName, dateCreated, labelType, miniPreview) {
        // Create label container
        const labelContainer = document.createElement('div');
        labelContainer.className = 'qr-label';
        if (miniPreview) {
            labelContainer.style.transform = 'scale(0.55)';
            labelContainer.style.transformOrigin = 'top left';
            labelContainer.style.marginBottom = '-70px';
        }
        
        // Create left side container for QR code and MaintainX logo
        const leftContainer = document.createElement('div');
        leftContainer.className = 'left-container';
        
        // Create QR code container with white background
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-code-container';
        qrContainer.style.backgroundColor = 'white';
        // Remove box shadow
        qrContainer.style.boxShadow = 'none';
        
        // Generate QR code using the qrcode-generator library
        // Use higher error correction to allow for the vacant square in the middle
        const qr = qrcode(0, 'H'); // High error correction
        qr.addData(url);
        qr.make();
        
        // Create QR code image with minimal margins
        const qrImg = document.createElement('div');
        qrImg.className = 'qr-code';
        qrImg.innerHTML = qr.createImgTag(4, 0); // 4=size, 0=margin (no white space)
        qrContainer.appendChild(qrImg);
        
        // Add logo in the center of QR code
        const centerLogoImg = document.createElement('img');
        centerLogoImg.className = 'center-logo';
        centerLogoImg.src = labelType === 'maintainx' ? 'images/X.png' : 'images/G.png';
        centerLogoImg.alt = labelType === 'maintainx' ? 'X Logo' : 'G Logo';
        qrContainer.appendChild(centerLogoImg);
        
        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        
        // Add title text
        const assetTitle = document.createElement('div');
        assetTitle.className = 'asset-title';
        assetTitle.textContent = labelType === 'maintainx' ? 'MaintainX Asset' : 'GitHub Docs';
        textContainer.appendChild(assetTitle);
        
        // Add asset name
        const assetNameDiv = document.createElement('div');
        assetNameDiv.className = 'asset-name';
        assetNameDiv.textContent = assetName;
        textContainer.appendChild(assetNameDiv);
        
        // Format date to display format (DD/MM/YYYY)
        const formattedDate = formatDate(dateCreated);
        
        // Add date created
        const dateCreatedDiv = document.createElement('div');
        dateCreatedDiv.className = 'date-created';
        dateCreatedDiv.textContent = `Date Created: ${formattedDate}`;
        textContainer.appendChild(dateCreatedDiv);
        
        // Create spacer div for better layout
        const spacerDiv = document.createElement('div');
        spacerDiv.style.flexGrow = '1';
        textContainer.appendChild(spacerDiv);
        
        // We don't use the logo container anymore since we're restructuring
        // the layout to place logos in different locations
        
        // Create MaintainX logo container (to be positioned under QR code)
        const maintainXContainer = document.createElement('div');
        maintainXContainer.className = 'maintainx-container';
        
        // Add bottom logo with appropriate class
        const bottomLogoImg = document.createElement('img');
        bottomLogoImg.className = labelType === 'maintainx' ? 'maintainx-logo' : 'github-logo';
        bottomLogoImg.src = labelType === 'maintainx' ? 'images/MaintainX.png' : 'images/Github.png';
        bottomLogoImg.alt = labelType === 'maintainx' ? 'MaintainX Logo' : 'GitHub Logo';
        maintainXContainer.appendChild(bottomLogoImg);
        
        // Add QR code and MaintainX logo to left container
        leftContainer.appendChild(qrContainer);
        leftContainer.appendChild(maintainXContainer);
        
        // Create BSI logo container
        const bsiLogoImg = document.createElement('img');
        bsiLogoImg.className = 'bsi-logo';
        bsiLogoImg.src = 'images/BSILogo.svg';
        bsiLogoImg.alt = 'BSI Logo';
        bsiLogoImg.style.width = '33mm';
        
        // Create a container for the BSI logo to ensure consistent positioning
        const bsiContainer = document.createElement('div');
        bsiContainer.style.width = '100%';
        bsiContainer.style.display = 'flex';
        bsiContainer.style.justifyContent = 'flex-start';
        bsiContainer.style.marginTop = 'auto';
        bsiContainer.appendChild(bsiLogoImg);
        
        // Assemble the label
        labelContainer.appendChild(leftContainer);
        labelContainer.appendChild(textContainer);
        textContainer.appendChild(bsiContainer);
        
        // Make sure QR code image is properly sized and positioned
        setTimeout(() => {
            const qrCodeImg = qrImg.querySelector('img');
            if (qrCodeImg) {
                // Force square aspect ratio and fill the container
                qrCodeImg.style.width = '100%';
                qrCodeImg.style.height = '100%';
                qrCodeImg.style.display = 'block';
                qrCodeImg.style.objectFit = 'fill';
                qrCodeImg.style.backgroundColor = 'white';
                qrCodeImg.style.padding = '0';
                qrCodeImg.style.margin = '0';
                
                // Create vacant center for logo by adding a white square overlay
                createVacantCenter(qrCodeImg, centerLogoImg);
            }
        }, 10);
        
        // Add the label to the target container
        targetContainer.appendChild(labelContainer);
        
        // Detect text wrapping and adjust sizes if needed
        setTimeout(() => {
            adjustForTextWrap(assetNameDiv, textContainer, bsiLogoImg);
        }, 50);
    }
    
    // Detect if asset name has wrapped to a second line and reduce sizes to fit
    function adjustForTextWrap(assetNameDiv, textContainer, bsiLogoImg) {
        const lineHeight = parseFloat(window.getComputedStyle(assetNameDiv).lineHeight) || (parseFloat(window.getComputedStyle(assetNameDiv).fontSize) * 1.2);
        if (assetNameDiv.offsetHeight > lineHeight * 1.5) {
            // Text has wrapped — reduce font sizes and BSI logo
            assetNameDiv.style.fontSize = '12px';
            const titleEl = textContainer.querySelector('.asset-title');
            if (titleEl) titleEl.style.fontSize = '11px';
            const dateEl = textContainer.querySelector('.date-created');
            if (dateEl) dateEl.style.fontSize = '10px';
            bsiLogoImg.style.width = '25mm';
        }
    }
    
    // Function to format date from YYYY-MM-DD to DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        
        return `${day}/${month}/${year}`;
    }
    
    // Function to create a vacant center in the QR code for the center logo
    function createVacantCenter(qrCodeImg, centerLogoImg) {
        // Create canvas to modify QR code
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Wait for the QR code image to load
        if (qrCodeImg.complete) {
            processQRCode();
        } else {
            qrCodeImg.onload = processQRCode;
        }
        
        function processQRCode() {
            const width = qrCodeImg.width;
            const height = qrCodeImg.height;
            canvas.width = width;
            canvas.height = height;
            
            // Draw QR code to canvas
            ctx.drawImage(qrCodeImg, 0, 0, width, height);
            
            // Create a white square in the center
            const centerSize = Math.min(width, height) * 0.25; // Size of white square
            const x = (width - centerSize) / 2;
            const y = (height - centerSize) / 2;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, centerSize, centerSize);
            
            // Replace the QR code image with the modified version
            const newImg = new Image();
            newImg.src = canvas.toDataURL('image/png');
            newImg.style.width = qrCodeImg.style.width;
            newImg.style.height = qrCodeImg.style.height;
            newImg.style.objectFit = qrCodeImg.style.objectFit;
            newImg.style.backgroundColor = qrCodeImg.style.backgroundColor;
            newImg.style.padding = qrCodeImg.style.padding;
            
            qrCodeImg.replaceWith(newImg);
            
            // Position center logo
            centerLogoImg.style.width = (centerSize * 0.9) + 'px';
        }
    }
});
