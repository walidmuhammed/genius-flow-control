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

  // A6 - Thermal Printer Format (Matching Master PDF Structure)
  if (size === 'A6') {
    return (
      <div className={`${sizeClasses.A6} waybill-container bg-white font-sans relative`}>
        {/* Header Section */}
        <div className="waybill-header">
          <div className="header-left">
            <div className="company-name">Topspeed</div>
          </div>
          <div className="header-center">
            <div className="order-number">Order #{data.orderId}</div>
            <div className="reference-number">REF-{data.referenceNumber}</div>
          </div>
          <div className="header-right">
            {barcode && (
              <img 
                src={barcode} 
                alt={`Barcode: ${data.trackingNumber}`} 
                className="barcode-image"
              />
            )}
          </div>
        </div>

        {/* Tracking Number Pill */}
        <div className="tracking-pill-container">
          <div className="tracking-pill">{data.trackingNumber}</div>
        </div>

        {/* Main Separator */}
        <div className="main-separator"></div>

        {/* Customer Information Section */}
        <div className="customer-section">
          <div className="section-header">
            <User className="section-icon" />
            <span className="section-title">Customer Information</span>
          </div>
          <div className="customer-name">{data.customer.name}</div>
          <div className="customer-phone">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="customer-phone-secondary">
              {data.customer.secondaryPhone} "secondary phone is available"
            </div>
          )}
          <div className="customer-location">{data.customer.city}, {data.customer.governorate}</div>
          <div className="customer-address">{data.customer.address}</div>
        </div>

        {/* Package & QR Section */}
        <div className="package-qr-section">
          <div className="package-column">
            <div className="section-header">
              <Package className="section-icon" />
              <span className="section-title">Package</span>
            </div>
            
            {/* Package Type Pills */}
            <div className="package-type-container">
              <span className="package-type-label">Parcel</span>
              {data.orderType === 'Exchange' && (
                <span className="exchange-pill">Exchange</span>
              )}
            </div>

            {/* Package Flags */}
            <div className="package-flags">
              <div className="flag-item">
                <div className={`checkbox ${!data.allowOpening ? 'checked' : ''}`}>
                  {!data.allowOpening && '■'}
                  {data.allowOpening && '□'}
                </div>
                <span>Package Inspection</span>
              </div>
              <div className="flag-item">
                <div className={`checkbox ${data.customer.isWorkAddress ? 'checked' : ''}`}>
                  {data.customer.isWorkAddress && '■'}
                  {!data.customer.isWorkAddress && '□'}
                </div>
                <span>Business Address</span>
              </div>
            </div>

            {/* Package Details */}
            <div className="package-details">
              <div>Description: {data.packageDescription || 'Clothes'}</div>
              <div>Number of Items: {data.itemsCount}</div>
            </div>
          </div>
          
          <div className="qr-column">
            {qrCode && (
              <div className="qr-container" dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>

        {/* Financials Section */}
        <div className="financials-section">
          <div className="section-header">
            <DollarSign className="section-icon" />
            <span className="section-title">Financials</span>
          </div>
          <div className="cash-collection-label">Cash Collection</div>
          <div className="cash-amounts">
            USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="notes-column">
            {data.deliveryNotes && (
              <>
                <div className="section-header">
                  <FileText className="section-icon" />
                  <span className="section-title">Notes</span>
                </div>
                <div className="notes-content">{data.deliveryNotes}</div>
              </>
            )}
          </div>
          <div className="business-column">
            <div className="section-header">
              <Building2 className="section-icon" />
              <span className="section-title">Business Information</span>
            </div>
            <div className="business-name">{data.merchant.businessName}</div>
            <div className="business-phone">{data.merchant.contactPhone}</div>
            <div className="business-location">{data.merchant.address}</div>
          </div>
        </div>
      </div>
    );
  }

  // A5 - Half Page Format (Matching Master PDF Structure)
  if (size === 'A5') {
    return (
      <div className={`${sizeClasses.A5} waybill-container bg-white font-sans relative`}>
        {/* Header Section */}
        <div className="waybill-header">
          <div className="header-left">
            <div className="company-name">Topspeed</div>
          </div>
          <div className="header-center">
            <div className="order-number">Order #{data.orderId}</div>
            <div className="reference-number">REF-{data.referenceNumber}</div>
          </div>
          <div className="header-right">
            {barcode && (
              <img 
                src={barcode} 
                alt={`Barcode: ${data.trackingNumber}`} 
                className="barcode-image"
              />
            )}
          </div>
        </div>

        {/* Tracking Number Pill */}
        <div className="tracking-pill-container">
          <div className="tracking-pill">{data.trackingNumber}</div>
        </div>

        {/* Main Separator */}
        <div className="main-separator"></div>

        {/* Customer Information Section */}
        <div className="customer-section">
          <div className="section-header">
            <User className="section-icon" />
            <span className="section-title">Customer Information</span>
          </div>
          <div className="customer-name">{data.customer.name}</div>
          <div className="customer-phone">{data.customer.phone}</div>
          {data.customer.secondaryPhone && (
            <div className="customer-phone-secondary">
              {data.customer.secondaryPhone} "secondary phone is available"
            </div>
          )}
          <div className="customer-location">{data.customer.city}, {data.customer.governorate}</div>
          <div className="customer-address">{data.customer.address}</div>
        </div>

        {/* Package & QR Section */}
        <div className="package-qr-section">
          <div className="package-column">
            <div className="section-header">
              <Package className="section-icon" />
              <span className="section-title">Package</span>
            </div>
            
            {/* Package Type Pills */}
            <div className="package-type-container">
              <span className="package-type-label">Parcel</span>
              {data.orderType === 'Exchange' && (
                <span className="exchange-pill">Exchange</span>
              )}
            </div>

            {/* Package Flags */}
            <div className="package-flags">
              <div className="flag-item">
                <div className={`checkbox ${!data.allowOpening ? 'checked' : ''}`}>
                  {!data.allowOpening && '■'}
                  {data.allowOpening && '□'}
                </div>
                <span>Package Inspection</span>
              </div>
              <div className="flag-item">
                <div className={`checkbox ${data.customer.isWorkAddress ? 'checked' : ''}`}>
                  {data.customer.isWorkAddress && '■'}
                  {!data.customer.isWorkAddress && '□'}
                </div>
                <span>Business Address</span>
              </div>
            </div>

            {/* Package Details */}
            <div className="package-details">
              <div>Description: {data.packageDescription || 'Clothes'}</div>
              <div>Number of Items: {data.itemsCount}</div>
            </div>
          </div>
          
          <div className="qr-column">
            {qrCode && (
              <div className="qr-container" dangerouslySetInnerHTML={{ __html: qrCode }} />
            )}
          </div>
        </div>

        {/* Financials Section */}
        <div className="financials-section">
          <div className="section-header">
            <DollarSign className="section-icon" />
            <span className="section-title">Financials</span>
          </div>
          <div className="cash-collection-label">Cash Collection</div>
          <div className="cash-amounts">
            USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="notes-column">
            {data.deliveryNotes && (
              <>
                <div className="section-header">
                  <FileText className="section-icon" />
                  <span className="section-title">Notes</span>
                </div>
                <div className="notes-content">{data.deliveryNotes}</div>
              </>
            )}
          </div>
          <div className="business-column">
            <div className="section-header">
              <Building2 className="section-icon" />
              <span className="section-title">Business Information</span>
            </div>
            <div className="business-name">{data.merchant.businessName}</div>
            <div className="business-phone">{data.merchant.contactPhone}</div>
            <div className="business-location">{data.merchant.address}</div>
          </div>
        </div>
      </div>
    );
  }

  // A4 - Full Page Professional Waybill (Matching Master PDF Structure)
  return (
    <div className={`${sizeClasses.A4} waybill-container bg-white font-sans relative`}>
      {/* Header Section */}
      <div className="waybill-header">
        <div className="header-left">
          <div className="company-name">Topspeed</div>
        </div>
        <div className="header-center">
          <div className="order-number">Order #{data.orderId}</div>
          <div className="reference-number">REF-{data.referenceNumber}</div>
        </div>
        <div className="header-right">
          {barcode && (
            <img 
              src={barcode} 
              alt={`Barcode: ${data.trackingNumber}`} 
              className="barcode-image"
            />
          )}
        </div>
      </div>

      {/* Tracking Number Pill */}
      <div className="tracking-pill-container">
        <div className="tracking-pill">{data.trackingNumber}</div>
      </div>

      {/* Main Separator */}
      <div className="main-separator"></div>

      {/* Customer Information Section */}
      <div className="customer-section">
        <div className="section-header">
          <User className="section-icon" />
          <span className="section-title">Customer Information</span>
        </div>
        <div className="customer-name">{data.customer.name}</div>
        <div className="customer-phone">{data.customer.phone}</div>
        {data.customer.secondaryPhone && (
          <div className="customer-phone-secondary">
            {data.customer.secondaryPhone} "secondary phone is available"
          </div>
        )}
        <div className="customer-location">{data.customer.city}, {data.customer.governorate}</div>
        <div className="customer-address">{data.customer.address}</div>
      </div>

      {/* Package & QR Section */}
      <div className="package-qr-section">
        <div className="package-column">
          <div className="section-header">
            <Package className="section-icon" />
            <span className="section-title">Package</span>
          </div>
          
          {/* Package Type Pills */}
          <div className="package-type-container">
            <span className="package-type-label">Parcel</span>
            {data.orderType === 'Exchange' && (
              <span className="exchange-pill">Exchange</span>
            )}
          </div>

          {/* Package Flags */}
          <div className="package-flags">
            <div className="flag-item">
              <div className={`checkbox ${!data.allowOpening ? 'checked' : ''}`}>
                {!data.allowOpening && '■'}
                {data.allowOpening && '□'}
              </div>
              <span>Package Inspection</span>
            </div>
            <div className="flag-item">
              <div className={`checkbox ${data.customer.isWorkAddress ? 'checked' : ''}`}>
                {data.customer.isWorkAddress && '■'}
                {!data.customer.isWorkAddress && '□'}
              </div>
              <span>Business Address</span>
            </div>
          </div>

          {/* Package Details */}
          <div className="package-details">
            <div>Description: {data.packageDescription || 'Clothes'}</div>
            <div>Number of Items: {data.itemsCount}</div>
          </div>
        </div>
        
        <div className="qr-column">
          {qrCode && (
            <div className="qr-container" dangerouslySetInnerHTML={{ __html: qrCode }} />
          )}
        </div>
      </div>

      {/* Financials Section */}
      <div className="financials-section">
        <div className="section-header">
          <DollarSign className="section-icon" />
          <span className="section-title">Financials</span>
        </div>
        <div className="cash-collection-label">Cash Collection</div>
        <div className="cash-amounts">
          USD {data.cashCollectionUSD} - LBP {data.cashCollectionLBP.toLocaleString()}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="notes-column">
          {data.deliveryNotes && (
            <>
              <div className="section-header">
                <FileText className="section-icon" />
                <span className="section-title">Notes</span>
              </div>
              <div className="notes-content">{data.deliveryNotes}</div>
            </>
          )}
        </div>
        <div className="business-column">
          <div className="section-header">
            <Building2 className="section-icon" />
            <span className="section-title">Business Information</span>
          </div>
          <div className="business-name">{data.merchant.businessName}</div>
          <div className="business-phone">{data.merchant.contactPhone}</div>
          <div className="business-location">{data.merchant.address}</div>
        </div>
      </div>
    </div>
  );
};