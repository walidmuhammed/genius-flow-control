import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generate QR code as SVG string
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'svg' as const,
      quality: 1,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    };
    
    return await QRCode.toString(text, options);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

/**
 * Generate Code128 barcode as SVG string
 */
export const generateCode128 = (text: string): string => {
  try {
    // Create a temporary canvas element
    const canvas = document.createElement('canvas');
    
    JsBarcode(canvas, text, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 12,
      textAlign: "center",
      textPosition: "bottom",
      textMargin: 5,
      fontOptions: "",
      font: "monospace",
      background: "#ffffff",
      lineColor: "#000000",
      margin: 10
    });
    
    // Convert canvas to SVG
    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="100%" height="100%">
          <img src="${canvas.toDataURL()}" />
        </foreignObject>
      </svg>
    `;
    
    return svg;
  } catch (error) {
    console.error('Error generating Code128 barcode:', error);
    return '';
  }
};

/**
 * Format order ID as tracking number (zero-padded)
 */
export const formatTrackingNumber = (orderId: number): string => {
  return `TS-${orderId.toString().padStart(6, '0')}`;
};

/**
 * Validate barcode text
 */
export const validateBarcodeText = (text: string): boolean => {
  return text.length > 0 && text.length <= 48; // Code128 limit
};