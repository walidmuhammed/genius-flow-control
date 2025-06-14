
import { useState, useRef } from "react";
import { CustomerWithLocation } from "@/services/customers";
import { Order } from "@/services/orders";

export function useOrderForm(editOrder?: Order & { customer?: CustomerWithLocation }) {
  // All the state from CreateOrder...
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>('shipment');
  const [phone, setPhone] = useState<string>('+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedGovernorateName, setSelectedGovernorateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [cashCollection, setCashCollection] = useState<boolean>(true);
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [lbpAmount, setLbpAmount] = useState<string>('');
  const [phoneValid, setPhoneValid] = useState<boolean>(false);
  const [secondaryPhoneValid, setSecondaryPhoneValid] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [allowOpening, setAllowOpening] = useState<boolean>(false);
  const [existingCustomer, setExistingCustomer] = useState<CustomerWithLocation | null>(null);
  const [errors, setErrors] = useState<any>({});

  return {
    orderType, setOrderType,
    phone, setPhone,
    secondaryPhone, setSecondaryPhone,
    isSecondaryPhone, setIsSecondaryPhone,
    name, setName,
    isWorkAddress, setIsWorkAddress,
    packageType, setPackageType,
    selectedGovernorateId, setSelectedGovernorateId,
    selectedCityId, setSelectedCityId,
    selectedGovernorateName, setSelectedGovernorateName,
    selectedCityName, setSelectedCityName,
    cashCollection, setCashCollection,
    usdAmount, setUsdAmount,
    lbpAmount, setLbpAmount,
    phoneValid, setPhoneValid,
    secondaryPhoneValid, setSecondaryPhoneValid,
    address, setAddress,
    description, setDescription,
    itemsCount, setItemsCount,
    orderReference, setOrderReference,
    deliveryNotes, setDeliveryNotes,
    allowOpening, setAllowOpening,
    existingCustomer, setExistingCustomer,
    errors, setErrors,
  };
}
