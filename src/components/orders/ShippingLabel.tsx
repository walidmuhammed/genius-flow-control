import React, { useEffect, useState } from 'react';
import { LabelData } from '@/services/labelData';
import { generateQRCode, generateCode128 } from '@/utils/barcodeUtils';
import { Badge } from '@/components/ui/badge';
import { Check, Package, Phone, MapPin, DollarSign, User, Building2, FileText } from 'lucide-react';

export type LabelSize = 'A6' | 'A5' | 'A4';

interface ShippingLabelProps {
  data: LabelData;
  size: LabelSize;
}

export const ShippingLabel: React.FC<ShippingLabelProps> = ({ data, size }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');

  useEffect(() => {
    const generateCodes = async () => {
      const qr = await generateQRCode(data.trackingNumber);
      const bar = generateCode128(data.trackingNumber);
      setQrCode(qr);
      setBarcode(bar);
    };
    generateCodes();
  }, [data.trackingNumber]);

  const sizeClasses = {
    A6: 'w-[105mm] h-[148mm] text-xs',
    A5: 'w-[148mm] h-[210mm] text-sm',
    A4: 'w-[210mm] h-[297mm] text-base'
  };

  const qrSizes = {
    A6: 'w-16 h-16',
    A5: 'w-20 h-20', 
    A4: 'w-24 h-24'
  };

  // A6 - Thermal Printer Format (Matching PDF Structure)
  if (size === 'A6') {
    return (
      <div className={`${sizeClasses.A6} bg-white border border-black p-2 font-sans print:border-black relative overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-black">
          <div className="font-bold text-lg">Topspeed</div>
          <div className="text-right">
            <div className="font-bold text-sm">Order #{data.orderId}</div>
            <div className="text-xs">REF-{data.referenceNumber}</div>
          </div>
        </div>

        {/* Code128 Barcode - Header Position */}
        <div className="flex justify-center mb-2">
          {barcode && (
            <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="h-8 max-w-full" />
          )}
        </div>

        {/* Customer Information */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            <span className="text-xs font-semibold">Customer Information</span>
          </div>
          <div className="font-bold text-sm">{data.customer.name}</div>
          <div className="text-xs font-mono">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="text-xs font-mono">{data.customer.secondaryPhone}</div>
          )}
          <div className="text-xs">{data.customer.city}, {data.customer.governorate}</div>
          <div className="text-xs leading-tight">{data.customer.address}</div>
        </div>

        {/* Package & QR Code Row */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Package className="w-3 h-3" />
              <span className="text-xs font-semibold">Package</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {data.orderType === 'Exchange' ? (
                <div className="bg-black text-white px-2 py-0.5 rounded text-xs font-semibold">
                  Parcel Exchange
                </div>
              ) : (
                <div className="border border-black px-2 py-0.5 rounded text-xs font-semibold">
                  Parcel
                </div>
              )}
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1">
                <Check className={`w-3 h-3 ${data.allowOpening ? 'text-black' : 'text-gray-300'}`} />
                <span>Package Inspection</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className={`w-3 h-3 ${data.customer.isWorkAddress ? 'text-black' : 'text-gray-300'}`} />
                <span>Business Address</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {qrCode && (
              <div className={`${qrSizes.A6} border border-gray-300`} 
                   dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>

        {/* Description & Items */}
        <div className="mb-2 text-xs">
          <div>Description: {data.packageDescription || 'General Items'}</div>
          <div>Number of Items: {data.itemsCount}</div>
        </div>

        {/* Financials */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs font-semibold">Financials</span>
          </div>
          <div className="text-xs font-semibold">Cash Collection</div>
          <div className="text-sm font-bold">
            USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
          </div>
        </div>

        {/* Notes */}
        {data.deliveryNotes && (
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3" />
              <span className="text-xs font-semibold">Notes</span>
            </div>
            <div className="text-xs leading-tight">{data.deliveryNotes}</div>
          </div>
        )}

        {/* Business Information */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <Building2 className="w-3 h-3" />
            <span className="text-xs font-semibold">Business Information</span>
          </div>
          <div className="text-xs">
            <div className="font-semibold">{data.merchant.businessName}</div>
            <div>{data.merchant.contactPhone}</div>
            <div>{data.merchant.address}</div>
          </div>
        </div>

        {/* Tracking Number at Bottom */}
        <div className="text-center text-xs font-mono font-bold">
          {data.trackingNumber}
        </div>
      </div>
    );
  }

  // A5 - Half Page Format (Matching PDF Structure)
  if (size === 'A5') {
    return (
      <div className={`${sizeClasses.A5} bg-white border border-black p-3 font-sans print:border-black relative`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
          <div className="font-bold text-xl">Topspeed</div>
          <div className="text-center">
            <div className="font-bold text-base">Order #{data.orderId}</div>
            <div className="text-sm">REF-{data.referenceNumber}</div>
          </div>
          {barcode && (
            <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="h-8 max-w-[80px]" />
          )}
        </div>

        {/* Customer Information */}
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold">Customer Information</span>
          </div>
          <div className="font-bold text-base">{data.customer.name}</div>
          <div className="text-sm font-mono">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="text-sm font-mono">{data.customer.secondaryPhone}</div>
          )}
          <div className="text-sm">{data.customer.city}, {data.customer.governorate}</div>
          <div className="text-sm leading-normal">{data.customer.address}</div>
        </div>

        {/* Package & QR Code Row */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
              <Package className="w-4 h-4" />
              <span className="text-sm font-semibold">Package</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {data.orderType === 'Exchange' ? (
                <div className="bg-black text-white px-3 py-1 rounded text-sm font-semibold">
                  Parcel Exchange
                </div>
              ) : (
                <div className="border border-black px-3 py-1 rounded text-sm font-semibold">
                  Parcel
                </div>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${data.allowOpening ? 'text-black' : 'text-gray-300'}`} />
                <span>Package Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${data.customer.isWorkAddress ? 'text-black' : 'text-gray-300'}`} />
                <span>Business Address</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>Description: {data.packageDescription || 'General Items'}</div>
              <div>Number of Items: {data.itemsCount}</div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {qrCode && (
              <div className={`${qrSizes.A5} border border-gray-300`} 
                   dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>

        {/* Financials */}
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-semibold">Financials</span>
          </div>
          <div className="text-sm font-semibold mb-1">Cash Collection</div>
          <div className="text-base font-bold">
            USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
          </div>
        </div>

        {/* Notes & Business Information Row */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            {data.deliveryNotes && (
              <>
                <div className="flex items-center gap-1 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-semibold">Notes</span>
                </div>
                <div className="text-sm leading-normal">{data.deliveryNotes}</div>
              </>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Business Information</span>
            </div>
            <div className="text-sm">
              <div className="font-semibold">{data.merchant.businessName}</div>
              <div>{data.merchant.contactPhone}</div>
              <div>{data.merchant.address}</div>
            </div>
          </div>
        </div>

        {/* Tracking Number at Bottom */}
        <div className="text-center text-sm font-mono font-bold border-t border-gray-300 pt-2">
          {data.trackingNumber}
        </div>
      </div>
    );
  }

  // A4 - Full Page Professional Waybill (Matching PDF Structure)
  return (
    <div className={`${sizeClasses.A4} bg-white border border-black p-4 font-sans print:border-black relative`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
        <div className="font-bold text-2xl">Topspeed</div>
        <div className="text-center">
          <div className="font-bold text-xl">Order #{data.orderId}</div>
          <div className="text-base">REF-{data.referenceNumber}</div>
        </div>
        {barcode && (
          <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="h-10 max-w-[120px]" />
        )}
      </div>

      {/* Customer Information */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5" />
          <span className="text-base font-semibold">Customer Information</span>
        </div>
        <div className="font-bold text-lg">{data.customer.name}</div>
        <div className="text-base font-mono">{data.customer.phone}</div>
        {data.customer.secondaryPhone && (
          <div className="text-base font-mono">{data.customer.secondaryPhone}</div>
        )}
        <div className="text-base">{data.customer.city}, {data.customer.governorate}</div>
        <div className="text-base leading-relaxed">{data.customer.address}</div>
      </div>

      {/* Package & QR Code Row */}
      <div className="flex items-start gap-6 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5" />
            <span className="text-base font-semibold">Package</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            {data.orderType === 'Exchange' ? (
              <div className="bg-black text-white px-4 py-2 rounded text-base font-semibold">
                Parcel Exchange
              </div>
            ) : (
              <div className="border border-black px-4 py-2 rounded text-base font-semibold">
                Parcel
              </div>
            )}
          </div>
          <div className="space-y-2 text-base">
            <div className="flex items-center gap-2">
              <Check className={`w-5 h-5 ${data.allowOpening ? 'text-black' : 'text-gray-300'}`} />
              <span>Package Inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`w-5 h-5 ${data.customer.isWorkAddress ? 'text-black' : 'text-gray-300'}`} />
              <span>Business Address</span>
            </div>
          </div>
          <div className="mt-3 text-base">
            <div>Description: {data.packageDescription || 'General Items'}</div>
            <div>Number of Items: {data.itemsCount}</div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {qrCode && (
            <div className={`${qrSizes.A4} border border-gray-300`} 
                 dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>
      </div>

      {/* Financials */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5" />
          <span className="text-base font-semibold">Financials</span>
        </div>
        <div className="text-base font-semibold mb-2">Cash Collection</div>
        <div className="text-lg font-bold">
          USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
        </div>
      </div>

      {/* Notes & Business Information Row */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          {data.deliveryNotes && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5" />
                <span className="text-base font-semibold">Notes</span>
              </div>
              <div className="text-base leading-relaxed">{data.deliveryNotes}</div>
            </>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5" />
            <span className="text-base font-semibold">Business Information</span>
          </div>
          <div className="text-base">
            <div className="font-semibold">{data.merchant.businessName}</div>
            <div>{data.merchant.contactPhone}</div>
            <div>{data.merchant.address}</div>
          </div>
        </div>
      </div>

      {/* Tracking Number at Bottom */}
      <div className="text-center text-base font-mono font-bold border-t border-gray-300 pt-3">
        {data.trackingNumber}
      </div>
    </div>
  );
};