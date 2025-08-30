import React, { useEffect, useState } from 'react';
import { LabelData } from '@/services/labelData';
import { generateQRCode, generateCode128 } from '@/utils/barcodeUtils';
import { Badge } from '@/components/ui/badge';
import { Check, Circle, Package, Phone, MapPin, DollarSign, Clock } from 'lucide-react';

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

  // A6 - Thermal Printer Format
  if (size === 'A6') {
    return (
      <div className={`${sizeClasses.A6} bg-white border-2 border-gray-900 p-2 font-mono print:border-black relative overflow-hidden`}>
        {/* Header with Company & Tracking */}
        <div className="flex items-start justify-between mb-2 pb-1 border-b-2 border-gray-900">
          <div className="flex-1">
            <div className="font-black text-lg tracking-wide">{data.company.name}</div>
            <div className="text-xs font-semibold">{data.createdDate} {data.createdTime}</div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="font-black text-sm bg-gray-900 text-white px-2 py-1 rounded">
              {data.trackingNumber}
            </div>
            <div className="text-xs font-bold mt-1">#{data.orderId}</div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="mb-2 p-1 bg-gray-100 rounded border">
          <div className="text-xs font-bold text-gray-700 uppercase">FROM:</div>
          <div className="font-semibold text-xs">{data.merchant.businessName}</div>
          <div className="text-xs">{data.merchant.contactPerson}</div>
          {data.merchant.contactPhone && (
            <div className="text-xs font-mono">{data.merchant.contactPhone}</div>
          )}
          <div className="text-xs text-gray-600">{data.merchant.address}</div>
        </div>

        {/* Receiver Information */}
        <div className="mb-2 p-1 border-2 border-gray-900 rounded">
          <div className="text-xs font-bold text-gray-700 uppercase mb-1">TO:</div>
          <div className="font-bold text-sm">{data.customer.name}</div>
          <div className="font-mono text-xs">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="font-mono text-xs">{data.customer.secondaryPhone}</div>
          )}
          <div className="text-xs font-semibold mt-1">
            {data.customer.city}, {data.customer.governorate}
          </div>
          <div className="text-xs break-words leading-tight">{data.customer.address}</div>
        </div>

        {/* Order Details */}
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span className="font-semibold">{data.packageType}</span>
            <Badge variant="outline" className="text-xs h-4 px-1 ml-1">
              {data.orderType}
            </Badge>
          </div>
          <div className="font-mono text-xs">
            Items: {data.itemsCount}
          </div>
        </div>

        {/* Cash Collection */}
        {data.cashCollectionEnabled && (data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
          <div className="mb-2 p-1 bg-yellow-100 border-2 border-yellow-400 rounded">
            <div className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              COLLECT:
            </div>
            <div className="font-black text-sm">
              {data.cashCollectionUSD > 0 && `$${data.cashCollectionUSD}`}
              {data.cashCollectionUSD > 0 && data.cashCollectionLBP > 0 && ' + '}
              {data.cashCollectionLBP > 0 && `${data.cashCollectionLBP.toLocaleString()}L`}
            </div>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="mb-2 text-xs">
          <span className="font-semibold">Delivery Fee: </span>
          <span className="font-mono">
            ${data.deliveryFeeUSD} / {data.deliveryFeeLBP.toLocaleString()}L
          </span>
        </div>

        {/* Special Instructions */}
        <div className="flex gap-2 text-xs mb-2">
          {data.customer.isWorkAddress && (
            <div className="flex items-center gap-1 bg-blue-100 px-1 rounded">
              <Check className="w-3 h-3" />
              <span className="font-semibold">Work</span>
            </div>
          )}
          {data.allowOpening && (
            <div className="flex items-center gap-1 bg-green-100 px-1 rounded">
              <Check className="w-3 h-3" />
              <span className="font-semibold">Inspect OK</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {data.deliveryNotes && (
          <div className="text-xs mb-2 p-1 bg-gray-50 border border-gray-300 rounded">
            <div className="font-bold text-gray-700">NOTE:</div>
            <div className="break-words line-clamp-2 text-gray-800">{data.deliveryNotes}</div>
          </div>
        )}

        {/* Reference */}
        {data.referenceNumber !== '—' && (
          <div className="text-xs font-mono mb-2">REF: {data.referenceNumber}</div>
        )}

        {/* QR Code */}
        <div className="flex justify-center mb-2">
          {qrCode && (
            <div className={`${qrSizes.A6} border border-gray-300`} 
                 dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>

        {/* Barcode Footer */}
        <div className="mt-auto border-t border-gray-300 pt-1">
          {barcode && (
            <div className="flex justify-center">
              <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // A5 - Half Page Format
  if (size === 'A5') {
    return (
      <div className={`${sizeClasses.A5} bg-white border-2 border-gray-900 p-4 font-mono print:border-black relative`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-900">
          <div className="flex-1">
            <div className="font-black text-2xl tracking-wide">{data.company.name}</div>
            <div className="text-sm font-semibold text-gray-600">SHIPPING WAYBILL</div>
            <div className="text-sm">{data.createdDate} at {data.createdTime}</div>
            {data.company.website && (
              <div className="text-xs text-gray-500">{data.company.website}</div>
            )}
          </div>
          <div className="text-center mx-4">
            <div className="font-black text-xl bg-gray-900 text-white px-3 py-2 rounded mb-1">
              {data.trackingNumber}
            </div>
            <div className="text-sm font-bold">Order #{data.orderId}</div>
            {data.referenceNumber !== '—' && (
              <div className="text-xs">Ref: {data.referenceNumber}</div>
            )}
          </div>
          <div className="flex-shrink-0">
            {qrCode && (
              <div className={`${qrSizes.A5} border-2 border-gray-300`} 
                   dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>

        {/* Sender and Order Details Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            {/* Sender Information */}
            <div className="p-3 bg-gray-100 rounded border">
              <div className="font-bold text-sm text-gray-700 uppercase mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Sender Information
              </div>
              <div className="font-bold text-base">{data.merchant.businessName}</div>
              <div className="text-sm">{data.merchant.fullName}</div>
              <div className="text-sm">{data.merchant.businessType}</div>
              {data.merchant.contactPhone && (
                <div className="flex items-center gap-1 text-sm font-mono">
                  <Phone className="w-3 h-3" />
                  {data.merchant.contactPhone}
                </div>
              )}
              <div className="text-sm text-gray-600 mt-1">{data.merchant.address}</div>
            </div>
            
            {/* Order Details */}
            <div className="p-3 border-2 border-gray-300 rounded">
              <div className="font-bold text-sm text-gray-700 uppercase mb-2 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Order Details
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="font-semibold">
                  {data.orderType}
                </Badge>
                <Badge variant="outline">
                  {data.packageType}
                </Badge>
                <span className="text-sm">({data.itemsCount} items)</span>
              </div>
              {data.packageDescription && (
                <div className="text-sm text-gray-600 mb-2">{data.packageDescription}</div>
              )}
              <div className="text-sm">
                <span className="font-semibold">Delivery Fee: </span>
                <span className="font-mono">${data.deliveryFeeUSD} / {data.deliveryFeeLBP.toLocaleString()}L</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Cash Collection */}
            {data.cashCollectionEnabled && (data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
              <div className="p-3 bg-yellow-50 border-2 border-yellow-400 rounded">
                <div className="font-bold text-sm text-yellow-800 uppercase mb-2 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Cash to Collect
                </div>
                <div className="space-y-1">
                  {data.cashCollectionUSD > 0 && (
                    <div className="text-xl font-black text-yellow-900">
                      ${data.cashCollectionUSD} USD
                    </div>
                  )}
                  {data.cashCollectionLBP > 0 && (
                    <div className="text-xl font-black text-yellow-900">
                      {data.cashCollectionLBP.toLocaleString()} LBP
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Instructions */}
            <div className="p-3 border border-gray-300 rounded">
              <div className="font-bold text-sm text-gray-700 uppercase mb-2">Service Options</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {data.customer.isWorkAddress && (
                  <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    <span className="font-semibold">Work Address</span>
                  </div>
                )}
                {data.allowOpening && (
                  <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    <span className="font-semibold">Inspection Allowed</span>
                  </div>
                )}
                {!data.customer.isWorkAddress && !data.allowOpening && (
                  <div className="text-gray-500 italic">Standard delivery</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="mb-4 p-4 border-2 border-gray-900 rounded">
          <div className="font-bold text-lg text-gray-700 uppercase mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Delivery Address
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-lg">{data.customer.name}</div>
              <div className="flex items-center gap-1 font-mono text-base">
                <Phone className="w-4 h-4" />
                {data.customer.phone}
              </div>
              {data.customer.secondaryPhone && (
                <div className="flex items-center gap-1 font-mono text-base">
                  <Phone className="w-4 h-4" />
                  {data.customer.secondaryPhone}
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-base text-gray-700">
                {data.customer.city}, {data.customer.governorate}
              </div>
              <div className="break-words text-base leading-relaxed">{data.customer.address}</div>
            </div>
          </div>
        </div>

        {/* Delivery Notes */}
        {data.deliveryNotes && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded">
            <div className="font-bold text-sm text-blue-800 uppercase mb-1">Special Instructions:</div>
            <div className="break-words text-base text-blue-900">{data.deliveryNotes}</div>
          </div>
        )}

        {/* Footer with Support */}
        <div className="text-center text-xs text-gray-500 mb-3">
          Support: {data.company.supportPhone} | {data.company.website}
        </div>

        {/* Barcode Footer */}
        <div className="flex justify-center border-t border-gray-300 pt-2">
          {barcode && (
            <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
          )}
        </div>
      </div>
    );
  }

  // A4 - Full Page Professional Waybill
  return (
    <div className={`${sizeClasses.A4} bg-white border-2 border-gray-900 p-6 font-mono print:border-black relative`}>
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-gray-900">
        <div className="flex-1">
          <div className="font-black text-4xl tracking-wide mb-1">{data.company.name}</div>
          <div className="text-xl font-bold text-gray-600 mb-1">SHIPPING WAYBILL</div>
          <div className="text-base font-semibold">{data.createdDate} at {data.createdTime}</div>
          {data.company.website && (
            <div className="text-sm text-gray-500 mt-1">{data.company.website}</div>
          )}
        </div>
        <div className="text-center mx-6">
          <div className="font-black text-3xl bg-gray-900 text-white px-4 py-3 rounded mb-2">
            {data.trackingNumber}
          </div>
          <div className="text-lg font-bold">Order #{data.orderId}</div>
          {data.referenceNumber !== '—' && (
            <div className="text-base">Reference: {data.referenceNumber}</div>
          )}
        </div>
        <div className="flex-shrink-0">
          {qrCode && (
            <div className={`${qrSizes.A4} border-2 border-gray-300`} 
                 dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Sender Information */}
          <div className="p-4 bg-gray-100 rounded-lg border">
            <div className="font-bold text-lg text-gray-700 uppercase mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Sender Information
            </div>
            <div className="space-y-2">
              <div className="font-bold text-xl">{data.merchant.businessName}</div>
              <div className="text-base">{data.merchant.fullName}</div>
              <div className="text-base text-gray-600">{data.merchant.businessType}</div>
              {data.merchant.contactPhone && (
                <div className="flex items-center gap-2 text-base font-mono">
                  <Phone className="w-4 h-4" />
                  {data.merchant.contactPhone}
                </div>
              )}
              <div className="text-base text-gray-600 mt-2">{data.merchant.address}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-4 border-2 border-gray-300 rounded-lg">
            <div className="font-bold text-lg text-gray-700 uppercase mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Information
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-base px-3 py-1 font-bold">
                  {data.orderType}
                </Badge>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {data.packageType}
                </Badge>
              </div>
              <div className="text-base">
                <span className="font-semibold">Quantity: </span>
                <span className="font-mono">{data.itemsCount} items</span>
              </div>
              {data.packageDescription && (
                <div className="text-base">
                  <span className="font-semibold">Description: </span>
                  <span>{data.packageDescription}</span>
                </div>
              )}
              <div className="text-base">
                <span className="font-semibold">Delivery Fee: </span>
                <span className="font-mono text-lg">
                  ${data.deliveryFeeUSD} / {data.deliveryFeeLBP.toLocaleString()}L
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Cash Collection */}
          {data.cashCollectionEnabled && (data.cashCollectionUSD > 0 || data.cashCollectionLBP > 0) && (
            <div className="p-4 bg-yellow-50 border-4 border-yellow-400 rounded-lg">
              <div className="font-bold text-lg text-yellow-800 uppercase mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cash Collection Required
              </div>
              <div className="space-y-2">
                {data.cashCollectionUSD > 0 && (
                  <div className="text-3xl font-black text-yellow-900">
                    ${data.cashCollectionUSD} USD
                  </div>
                )}
                {data.cashCollectionLBP > 0 && (
                  <div className="text-3xl font-black text-yellow-900">
                    {data.cashCollectionLBP.toLocaleString()} LBP
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Instructions */}
          <div className="p-4 border border-gray-300 rounded-lg">
            <div className="font-bold text-lg text-gray-700 uppercase mb-3">
              Service Instructions
            </div>
            <div className="space-y-2">
              {data.customer.isWorkAddress && (
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold text-base">Work Address Delivery</span>
                </div>
              )}
              {data.allowOpening && (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold text-base">Package Inspection Allowed</span>
                </div>
              )}
              {!data.customer.isWorkAddress && !data.allowOpening && (
                <div className="text-gray-500 italic text-base">Standard delivery service</div>
              )}
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <div className="font-bold text-lg text-blue-800 uppercase mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Service Timeline
            </div>
            <div className="text-base text-blue-900">
              <div>Processed: {data.createdDate} {data.createdTime}</div>
              <div className="text-sm text-blue-700 mt-1">Standard delivery: 1-2 business days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Information */}
      <div className="mb-6 p-5 border-4 border-gray-900 rounded-lg bg-gray-50">
        <div className="font-bold text-2xl text-gray-700 uppercase mb-4 flex items-center gap-3">
          <MapPin className="w-6 h-6" />
          Delivery Address
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-bold text-2xl mb-2">{data.customer.name}</div>
            <div className="flex items-center gap-2 font-mono text-lg mb-2">
              <Phone className="w-5 h-5" />
              {data.customer.phone}
            </div>
            {data.customer.secondaryPhone && (
              <div className="flex items-center gap-2 font-mono text-lg">
                <Phone className="w-5 h-5" />
                {data.customer.secondaryPhone}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-xl text-gray-700 mb-2">
              {data.customer.city}, {data.customer.governorate}
            </div>
            <div className="break-words text-lg leading-relaxed">{data.customer.address}</div>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {data.deliveryNotes && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="font-bold text-lg text-blue-800 uppercase mb-2">
            Special Delivery Instructions:
          </div>
          <div className="break-words text-lg text-blue-900 leading-relaxed">
            {data.deliveryNotes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="text-center text-sm text-gray-500 mb-4">
          24/7 Support: {data.company.supportPhone} | Visit: {data.company.website}
        </div>
        
        {/* Barcode */}
        <div className="flex justify-center">
          {barcode && (
            <div className="border border-gray-300 p-2 rounded">
              <img src={barcode} alt={`Barcode: ${data.trackingNumber}`} className="max-w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};