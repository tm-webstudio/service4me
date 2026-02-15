// Centralized service type definitions for all provider types

export interface ServiceType {
  value: string
  label: string
}

export const SERVICE_TYPES: ServiceType[] = [
  { value: 'hairstylist', label: 'Hairstylist' },
  { value: 'nail_technician', label: 'Nail Technician' },
  { value: 'lash_technician', label: 'Lash Technician' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
  { value: 'brow_technician', label: 'Brow Technician' },
  { value: 'esthetician', label: 'Esthetician' },
  { value: 'massage_therapist', label: 'Massage Therapist' },
]

export const SPECIALTIES_BY_TYPE: Record<string, string[]> = {
  hairstylist: [
    'Wigs',
    'Braids',
    'Locs',
    'Natural Hair',
    'Bridal Hair',
    'Silk Press',
  ],
  nail_technician: [
    'Acrylic Nails',
    'Gel Nails',
    'Nail Art',
    'Manicure & Pedicure',
    'SNS/Dip Powder',
    'Press-On Nails',
  ],
  lash_technician: [
    'Classic Lashes',
    'Volume Lashes',
    'Hybrid Lashes',
    'Mega Volume',
    'Lash Lift & Tint',
    'Lower Lashes',
  ],
  makeup_artist: [
    'Bridal Makeup',
    'Editorial Makeup',
    'Special Effects',
    'Natural/Everyday',
    'Glam Makeup',
    'Airbrush Makeup',
  ],
  brow_technician: [
    'Microblading',
    'Brow Lamination',
    'Brow Tinting',
    'Ombré Brows',
    'Nano Brows',
    'Threading',
  ],
  esthetician: [
    'Facials',
    'Chemical Peels',
    'Microdermabrasion',
    'Dermaplaning',
    'Acne Treatment',
    'Anti-Aging',
  ],
  massage_therapist: [
    'Deep Tissue',
    'Swedish Massage',
    'Sports Massage',
    'Hot Stone',
    'Prenatal Massage',
    'Lymphatic Drainage',
  ],
}

export const ADDITIONAL_SERVICES_BY_TYPE: Record<string, string[]> = {
  hairstylist: [
    'Wigs',
    'Braids',
    'Locs',
    'Natural Hair',
    'Bridal Hair',
    'Silk Press',
    'Sew-Ins',
    'Butterfly Locs',
    'Ponytails',
  ],
  nail_technician: [
    'Acrylic Nails',
    'Gel Nails',
    'Nail Art',
    'Manicure & Pedicure',
    'SNS/Dip Powder',
    'Press-On Nails',
    'Nail Repair',
    'Gel Removal',
    'Paraffin Wax',
  ],
  lash_technician: [
    'Classic Lashes',
    'Volume Lashes',
    'Hybrid Lashes',
    'Mega Volume',
    'Lash Lift & Tint',
    'Lower Lashes',
    'Lash Removal',
    'Lash Infills',
    'Brow Tinting',
  ],
  makeup_artist: [
    'Bridal Makeup',
    'Editorial Makeup',
    'Special Effects',
    'Natural/Everyday',
    'Glam Makeup',
    'Airbrush Makeup',
    'Lash Application',
    'Contouring',
    'Colour Matching',
  ],
  brow_technician: [
    'Microblading',
    'Brow Lamination',
    'Brow Tinting',
    'Ombré Brows',
    'Nano Brows',
    'Threading',
    'Waxing',
    'Brow Mapping',
    'Lash Tinting',
  ],
  esthetician: [
    'Facials',
    'Chemical Peels',
    'Microdermabrasion',
    'Dermaplaning',
    'Acne Treatment',
    'Anti-Aging',
    'LED Therapy',
    'Extractions',
    'Hydrafacial',
  ],
  massage_therapist: [
    'Deep Tissue',
    'Swedish Massage',
    'Sports Massage',
    'Hot Stone',
    'Prenatal Massage',
    'Lymphatic Drainage',
    'Reflexology',
    'Cupping',
    'Aromatherapy',
  ],
}

export const SERVICE_TEMPLATES_BY_TYPE: Record<string, string[]> = {
  hairstylist: ['Box Braids', 'Silk Press', 'Wig Install', 'Loc Retwist', 'Sew-In', 'Cornrows'],
  nail_technician: ['Full Set Acrylic', 'Gel Manicure', 'Nail Art Design', 'Pedicure', 'Infill'],
  lash_technician: ['Full Set Classic', 'Full Set Volume', 'Infill', 'Lash Lift', 'Lash Removal'],
  makeup_artist: ['Full Glam', 'Bridal Makeup', 'Natural Look', 'Editorial', 'Lesson'],
  brow_technician: ['Microblading', 'Brow Lamination', 'Brow Shape & Tint', 'Touch-Up'],
  esthetician: ['Express Facial', 'Deep Cleanse Facial', 'Chemical Peel', 'Dermaplaning'],
  massage_therapist: ['30 Min Massage', '60 Min Massage', '90 Min Massage', 'Couples Massage'],
}

// Helper functions

export function getServiceTypeLabel(value: string): string {
  const type = SERVICE_TYPES.find(t => t.value === value)
  return type?.label || 'Beauty Professional'
}

export function getSpecialtiesForType(type: string): string[] {
  return SPECIALTIES_BY_TYPE[type] || SPECIALTIES_BY_TYPE.hairstylist
}

export function getAdditionalServicesForType(type: string): string[] {
  return ADDITIONAL_SERVICES_BY_TYPE[type] || ADDITIONAL_SERVICES_BY_TYPE.hairstylist
}

export function getServiceTemplatesForType(type: string): string[] {
  return SERVICE_TEMPLATES_BY_TYPE[type] || SERVICE_TEMPLATES_BY_TYPE.hairstylist
}
