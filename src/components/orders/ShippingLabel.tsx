import React, { useEffect, useState } from 'react';
import { LabelData } from '@/services/labelData';
import { generateQRCode, generateCode128 } from '@/utils/barcodeUtils';
import { Badge } from '@/components/ui/badge';
import { Check, Circle } from 'lucide-react';

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
    A6: 'w-12 h-12',
    A5: 'w-16 h-16', 
    A4: 'w-20 h-20'
  };

  if (size === 'A6') {
    return (
      <div className={`${sizeClasses.A6} bg-white border border-border p-2 font-mono print:border-0`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2 border-b border-border pb-1">
          <div>
            <div className="font-bold text-sm">TopSpeed</div>
            <div className="text-xs text-muted-foreground">{data.createdDate}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{data.trackingNumber}</div>
            <div className="text-xs">#{data.orderId}</div>
          </div>
          {qrCode && (
            <div className={`${qrSizes.A6} flex-shrink-0`} 
                 dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>

        {/* Customer Info */}
        <div className="mb-2">
          <div className="font-semibold">{data.customer.name}</div>
          <div className="text-xs">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="text-xs">{data.customer.secondaryPhone}</div>
          )}
          <div className="text-xs mt-1">
            <div>{data.customer.city}, {data.customer.governorate}</div>
            <div className="break-words">{data.customer.address}</div>
          </div>
        </div>

        {/* Cash Collection */}
        {(data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
          <div className="mb-2 p-1 bg-muted rounded">
            <div className="text-xs font-semibold">Cash Collection:</div>
            <div className="text-xs">
              ${data.cashCollectionUSD} / {data.cashCollectionLBP.toLocaleString()} LBP
            </div>
          </div>
        )}

        {/* Order Type & Package */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {data.orderType === 'Exchange' ? (
              <Circle className="w-3 h-3 fill-current" />
            ) : (
              <Circle className="w-3 h-3" />
            )}
            <span className="text-xs">{data.orderType}</span>
          </div>
          <Badge variant="outline" className="text-xs h-4 px-1">
            {data.packageType}
          </Badge>
        </div>

        {/* Reference */}
        {data.referenceNumber !== '—' && (
          <div className="text-xs mb-2">Ref: {data.referenceNumber}</div>
        )}

        {/* Flags */}
        <div className="flex gap-2 text-xs mb-2">
          {data.customer.isWorkAddress && (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Work</span>
            </div>
          )}
          {data.allowOpening && (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Inspect</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {data.deliveryNotes && (
          <div className="text-xs mb-2 p-1 bg-muted rounded">
            <div className="font-semibold">Notes:</div>
            <div className="break-words line-clamp-2">{data.deliveryNotes}</div>
          </div>
        )}

        {/* Merchant */}
        <div className="text-xs text-muted-foreground mb-2">
          <div>{data.merchant.businessName}</div>
          {data.merchant.phone && <div>{data.merchant.phone}</div>}
        </div>

        {/* Barcode Footer */}
        <div className="mt-auto">
          {barcode && (
            <div className="flex justify-center">
              <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (size === 'A5') {
    return (
      <div className={`${sizeClasses.A5} bg-white border border-border p-4 font-mono print:border-0`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <div>
            <div className="font-bold text-xl">TopSpeed</div>
            <div className="text-sm text-muted-foreground">{data.createdDate}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl">{data.trackingNumber}</div>
            <div className="text-sm">Order #{data.orderId}</div>
            {data.referenceNumber !== '—' && (
              <div className="text-sm">Ref: {data.referenceNumber}</div>
            )}
          </div>
          {qrCode && (
            <div className={`${qrSizes.A5} flex-shrink-0`} 
                 dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>

        {/* Order Details Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {data.orderType === 'Exchange' ? (
                <Circle className="w-4 h-4 fill-current" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="font-semibold">{data.orderType}</span>
              <Badge variant="outline" className="ml-2">
                {data.packageType}
              </Badge>
            </div>
            
            {(data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
              <div className="p-2 bg-muted rounded">
                <div className="font-semibold text-sm">Cash Collection:</div>
                <div className="text-lg font-bold">
                  ${data.cashCollectionUSD} / {data.cashCollectionLBP.toLocaleString()} LBP
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="font-semibold mb-1">Merchant:</div>
            <div>{data.merchant.businessName}</div>
            {data.merchant.phone && <div>{data.merchant.phone}</div>}
            {data.merchant.address && <div className="text-sm text-muted-foreground">{data.merchant.address}</div>}
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-4 p-3 border border-border rounded">
          <div className="font-semibold text-lg mb-2">Delivery To:</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">{data.customer.name}</div>
              <div>{data.customer.phone}</div>
              {data.customer.secondaryPhone && (
                <div>{data.customer.secondaryPhone}</div>
              )}
            </div>
            <div>
              <div className="font-semibold">{data.customer.city}, {data.customer.governorate}</div>
              <div className="break-words">{data.customer.address}</div>
            </div>
          </div>
          
          {/* Flags */}
          <div className="flex gap-4 mt-2 text-sm">
            {data.customer.isWorkAddress && (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Work Address</span>
              </div>
            )}
            {data.allowOpening && (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Allow Inspection</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Notes */}
        {data.deliveryNotes && (
          <div className="mb-4 p-3 bg-muted rounded">
            <div className="font-semibold mb-1">Delivery Notes:</div>
            <div className="break-words">{data.deliveryNotes}</div>
          </div>
        )}

        {/* Barcode Footer */}
        <div className="mt-auto flex justify-center">
          {barcode && (
            <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
          )}
        </div>
      </div>
    );
  }

  // A4 Layout
  return (
    <div className={`${sizeClasses.A4} bg-white border border-border p-6 font-mono print:border-0`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-4">
        <div>
          <div className="font-bold text-3xl">TopSpeed</div>
          <div className="text-lg text-muted-foreground">Shipping Label</div>
          <div className="text-sm text-muted-foreground">{data.createdDate}</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-4xl">{data.trackingNumber}</div>
          <div className="text-lg">Order #{data.orderId}</div>
        </div>
        {qrCode && (
          <div className={`${qrSizes.A4} flex-shrink-0`} 
               dangerouslySetInnerHTML={{ __html: qrCode }} />
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="font-semibold text-lg mb-2">Order Details:</div>
            <div className="flex items-center gap-3 mb-2">
              {data.orderType === 'Exchange' ? (
                <Circle className="w-5 h-5 fill-current" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
              <span className="font-semibold text-lg">{data.orderType}</span>
              <Badge variant="outline" className="ml-2">
                {data.packageType}
              </Badge>
            </div>
            {data.referenceNumber !== '—' && (
              <div className="text-sm">Reference: {data.referenceNumber}</div>
            )}
          </div>

          {(data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-semibold text-lg mb-2">Cash Collection:</div>
              <div className="text-2xl font-bold">
                ${data.cashCollectionUSD}
              </div>
              <div className="text-xl font-bold">
                {data.cashCollectionLBP.toLocaleString()} LBP
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="font-semibold text-lg mb-2">Merchant:</div>
          <div className="text-lg">{data.merchant.businessName}</div>
          {data.merchant.phone && <div className="text-sm">{data.merchant.phone}</div>}
          {data.merchant.address && <div className="text-sm text-muted-foreground">{data.merchant.address}</div>}
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6 p-4 border-2 border-border rounded-lg">
        <div className="font-semibold text-xl mb-3">Delivery Information:</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-lg">{data.customer.name}</div>
            <div className="text-base">{data.customer.phone}</div>
            {data.customer.secondaryPhone && (
              <div className="text-base">{data.customer.secondaryPhone}</div>
            )}
          </div>
          <div>
            <div className="font-semibold text-lg">{data.customer.city}, {data.customer.governorate}</div>
            <div className="break-words text-base">{data.customer.address}</div>
          </div>
        </div>
        
        {/* Flags */}
        <div className="flex gap-6 mt-3">
          {data.customer.isWorkAddress && (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Work Address</span>
            </div>
          )}
          {data.allowOpening && (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Allow Package Inspection</span>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Notes */}
      {data.deliveryNotes && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="font-semibold text-lg mb-2">Delivery Notes:</div>
          <div className="break-words text-base">{data.deliveryNotes}</div>
        </div>
      )}

      {/* Barcode Footer */}
      <div className="mt-auto flex justify-center pt-4">
        {barcode && (
          <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
        )}
      </div>
    </div>
  );
};