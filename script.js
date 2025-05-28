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
    
    // Set default date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateCreatedInput.value = `${year}-${month}-${day}`;
    
    // Preload images
    const xLogo = new Image();
    xLogo.src = 'images/X.png';
    
    const gLogo = new Image();
    gLogo.src = 'images/G.png';
    
    const maintainxLogo = new Image();
    maintainxLogo.src = 'images/MaintainX.png';
    
    const githubLogo = new Image();
    githubLogo.src = 'images/Github.png';
    
    const scionLogo = new Image();
    scionLogo.src = 'images/Scion.svg';
    
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
                .scion-logo {
                    width: 40mm;
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
                    <img class="scion-logo" src="images/Scion.svg" alt="Scion Logo">
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
    
    // Generate and display the label
    function generateLabel(url, assetName, dateCreated, labelType = 'maintainx') {
        // Clear the preview container
        labelPreview.innerHTML = '';
        
        // Create label container
        const labelContainer = document.createElement('div');
        labelContainer.className = 'qr-label';
        
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
        
        // Create Scion logo container
        const scionLogoImg = document.createElement('img');
        scionLogoImg.className = 'scion-logo';
        scionLogoImg.src = 'images/Scion.svg';
        scionLogoImg.alt = 'Scion Logo';
        scionLogoImg.style.width = '40mm'; // Double the size
        
        // Create a container for the Scion logo to ensure consistent positioning
        const scionContainer = document.createElement('div');
        scionContainer.style.width = '100%';
        scionContainer.style.display = 'flex';
        scionContainer.style.justifyContent = 'flex-start';
        scionContainer.style.marginTop = 'auto';
        scionContainer.appendChild(scionLogoImg);
        
        // Assemble the label
        labelContainer.appendChild(leftContainer);
        labelContainer.appendChild(textContainer);
        textContainer.appendChild(scionContainer);
        
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
        
        // Add the label to the preview
        labelPreview.appendChild(labelContainer);
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
