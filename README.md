# Asset QR Label Generator

This web application generates QR code labels for MaintainX assets with the following specifications:
- Label size: 38mm x 90mm (compatible with Brother QL1110NWB label printer)
- QR code with embedded X logo for instant MaintainX recognition
- Optimized print layout that scales to fill the entire label area
- Includes asset name, creation date, and branded logos

## Features

- Generate QR codes from any MaintainX asset URL
- Custom asset name input and date tracking
- Print-ready labels optimized for Brother QL1110NWB printer (38mm x 90mm)
- Live preview of labels before printing
- Automatic print functionality that handles printer dialog and window closing
- Comprehensive how-to guide with step-by-step instructions for getting the MaintainX URL
- Responsive design that works on desktop and mobile devices
- Professional branding with Scion and MaintainX logos

## How to Use

1. Open `index.html` in a web browser
2. Click on "How to get the URL from MaintainX" to learn how to obtain the correct asset URL
3. Enter the asset URL from MaintainX (which will be encoded in the QR code)
4. Enter the asset name
5. The date is automatically set to today (can be changed if needed)
6. Click "Generate Label" to create a preview
7. Review the label in the preview area
8. Click "Print Label" to open a print dialog and send the label to your printer

## Printing to Brother QL1110NWB

To print directly to the Brother QL1110NWB printer:

1. Ensure your Brother QL1110NWB printer is properly installed and connected
2. Use the "Print Label" button which will open the system print dialog
3. Select the Brother QL1110NWB printer from the list
4. Set the paper size to 38mm x 90mm if prompted
5. Proceed with printing

## Files

- `index.html` - Main application page with label generation functionality
- `how-to.html` - Step-by-step guide for obtaining MaintainX asset URLs
- `styles.css` - Styling for the application
- `script.js` - JavaScript code for QR generation and label functionality
- `images/` - Directory containing logos and instructional images
  - `MaintainX.png` - MaintainX logo for labels
  - `Scion.svg` - Scion logo for application branding and labels
  - `X.png` - X logo for QR codes
  - `instruct-*.png` - Step-by-step instructional images for the how-to guide

## Deployment

This application is deployed on GitHub Pages and accessible at:

[https://scionfacilities.github.io/](https://scionfacilities.github.io/)

## Printing Tips

- For best results, use continuous 38mm label rolls with Brother QL1110NWB printer
- Ensure the printer is set to 38mm × 90mm label size
- The application automatically scales the label to fit the entire print area
- No special driver configuration is needed - standard Brother printer drivers work well
