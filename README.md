# Asset QR Label Generator

This web application generates QR code labels for assets with the following specifications:
- Label size: 38mm x 90mm (compatible with Brother QL1110NWB label printer)
- QR code with embedded X logo
- MaintainX asset name
- MaintainX and Scion logos

## Features

- Generate QR codes from any URL
- Custom asset name input
- Print-ready labels sized for Brother QL1110NWB printer
- Preview labels before printing

## How to Use

1. Open `index.html` in a web browser
2. Enter the asset URL (which will be encoded in the QR code)
3. Enter the asset name
4. Click "Generate Label" to create a preview
5. Click "Print Label" to send the label to your printer

## Printing to Brother QL1110NWB

To print directly to the Brother QL1110NWB printer:

1. Ensure your Brother QL1110NWB printer is properly installed and connected
2. Use the "Print Label" button which will open the system print dialog
3. Select the Brother QL1110NWB printer from the list
4. Set the paper size to 38mm x 90mm if prompted
5. Proceed with printing

## Files

- `index.html` - Main application page
- `styles.css` - Styling for the application
- `script.js` - JavaScript code for QR generation and label functionality
- `images/` - Directory containing logos
  - MaintainX.png
  - Scion.svg
  - X.png
