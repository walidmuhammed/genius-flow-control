
import { Pickup } from '@/services/pickups';

export interface PickupData {
  id: string;
  pickupId: string;
  location: string;
  address?: string;
  contactPerson: string;
  contactPhone: string;
  pickupDate: string;
  status: string;
  note?: string;
  courier?: {
    name?: string;
    phone?: string;
  };
  pickedUp: boolean;
  requestedAt: string;
  updatedAt: string;
}

/**
 * Maps a pickup from the API format to the format expected by components
 */
export function mapPickupToComponentFormat(pickup: Pickup): PickupData {
  return {
    id: pickup.id,
    pickupId: pickup.pickup_id || '',
    location: pickup.location,
    address: pickup.address,
    contactPerson: pickup.contact_person,
    contactPhone: pickup.contact_phone,
    pickupDate: pickup.pickup_date,
    status: pickup.status,
    note: pickup.note,
    courier: {
      name: pickup.courier_name,
      phone: pickup.courier_phone
    },
    pickedUp: pickup.picked_up || false,
    requestedAt: pickup.created_at,
    updatedAt: pickup.updated_at
  };
}

/**
 * Maps an array of API pickups to component format
 */
export function mapPickupsToComponentFormat(pickups: Pickup[]): PickupData[] {
  return pickups.map(mapPickupToComponentFormat);
}
