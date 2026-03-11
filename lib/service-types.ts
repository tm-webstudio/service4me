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

export const SERVICES_BY_SPECIALTY: Record<string, string[]> = {
  // Hairstylist specialties
  'Locs': [
    'Starter Locs',
    'Retwist',
    'Instant Locs',
    'Retwist + Style',
    'Loc Styling Only',
    'Crochet Retwist',
    'Loc Repair',
    'Loc Extensions',
    'Loc Re-attachment',
    'Loc Colouring',
  ],
  'Braids': [
    'Box Braids',
    'Knotless Braids',
    'Cornrows',
    'Stitch Braids',
    'Lemonade Braids',
    'Goddess Braids',
    'Fulani Braids',
    'Butterfly Braids',
    'Crochet Braids',
    'Micro Braids',
    'Feed-In Braids',
  ],
  'Wigs': [
    'Frontal Wig Install',
    'Closure Wig Install',
    'Custom Wig Making',
    'Wig Revamp/Wash',
    'Wig Colouring',
    'Wig Re-installation',
    'Glueless Install',
    'Wig Customisation',
  ],
  'Natural Hair': [
    'Wash & Go',
    'Twist Out',
    'Bantu Knots',
    'Flexi Rod Set',
    'Silk Press',
    'Deep Conditioning Treatment',
    'Trim & Shape',
    'Protective Styling',
    'Scalp Treatment',
  ],
  'Bridal Hair': [
    'Bridal Updo',
    'Bridal Trial',
    'Bridesmaid Styling',
    'Bridal Wig Install',
    'Bridal Braids',
    'Bridal Locs Styling',
    'Mother of the Bride',
    'Bridal Hair Accessories',
  ],
  'Silk Press': [
    'Silk Press (Short Hair)',
    'Silk Press (Medium Hair)',
    'Silk Press (Long Hair)',
    'Silk Press + Trim',
    'Silk Press + Treatment',
    'Silk Press + Colour',
  ],
  // Nail technician specialties
  'Acrylic Nails': ['Full Set', 'Infill', 'Removal', 'Nail Repair', 'Acrylic Overlay', 'Nail Art Add-On'],
  'Gel Nails': ['Gel Manicure', 'Gel Removal', 'Gel Overlay', 'Builder Gel', 'Gel Infill', 'Gel Extensions'],
  'Nail Art': ['Hand-Painted Art', 'Chrome Nails', '3D Nail Art', 'Foil Nails', 'Stamping', 'French Tip'],
  'Manicure & Pedicure': ['Classic Manicure', 'Classic Pedicure', 'Luxury Manicure', 'Luxury Pedicure', 'Spa Pedicure', 'Paraffin Wax Treatment'],
  'SNS/Dip Powder': ['SNS Full Set', 'SNS Infill', 'SNS Removal', 'SNS Overlay', 'SNS with Art'],
  'Press-On Nails': ['Custom Press-Ons', 'Press-On Fitting', 'Press-On Set (Short)', 'Press-On Set (Long)', 'Press-On with Art'],
  // Lash technician specialties
  'Classic Lashes': ['Full Set', 'Infill', 'Removal', 'Mini Set'],
  'Volume Lashes': ['Full Set', 'Infill', 'Removal', 'Mini Set'],
  'Hybrid Lashes': ['Full Set', 'Infill', 'Removal', 'Mini Set'],
  'Mega Volume': ['Full Set', 'Infill', 'Removal'],
  'Lash Lift & Tint': ['Lash Lift', 'Lash Tint', 'Lash Lift & Tint Combo'],
  'Lower Lashes': ['Lower Lash Full Set', 'Lower Lash Infill'],
  // Makeup artist specialties
  'Bridal Makeup': ['Bridal Trial', 'Wedding Day Makeup', 'Bridesmaid Makeup', 'Mother of the Bride', 'Touch-Up Kit'],
  'Editorial Makeup': ['Editorial Shoot', 'Lookbook', 'Campaign Makeup', 'Creative Direction'],
  'Special Effects': ['SFX Prosthetics', 'Wound Simulation', 'Character Makeup', 'Body Paint'],
  'Natural/Everyday': ['Natural Glam', 'Everyday Makeup', 'Makeup Lesson', 'Minimal Makeup'],
  'Glam Makeup': ['Full Glam', 'Soft Glam', 'Party Makeup', 'Prom Makeup', 'Red Carpet'],
  'Airbrush Makeup': ['Airbrush Bridal', 'Airbrush Full Face', 'Airbrush Touch-Up'],
  // Brow technician specialties
  'Microblading': ['Initial Session', 'Top-Up Session', 'Colour Boost', 'Consultation'],
  'Brow Lamination': ['Brow Lamination', 'Lamination + Tint', 'Lamination + Shape'],
  'Brow Tinting': ['Brow Tint', 'Brow Shape + Tint', 'Lash + Brow Tint'],
  'Ombré Brows': ['Initial Session', 'Top-Up Session', 'Colour Boost'],
  'Nano Brows': ['Initial Session', 'Top-Up Session', 'Colour Boost'],
  'Threading': ['Brow Threading', 'Upper Lip Threading', 'Full Face Threading'],
  // Esthetician specialties
  'Facials': ['Express Facial', 'Deep Cleanse Facial', 'Hydrating Facial', 'Anti-Aging Facial', 'Brightening Facial'],
  'Chemical Peels': ['Superficial Peel', 'Medium Peel', 'Glycolic Peel', 'Salicylic Peel', 'Consultation'],
  'Microdermabrasion': ['Single Session', 'Course of 3', 'Course of 6', 'Add-On Treatment'],
  'Dermaplaning': ['Dermaplaning Facial', 'Dermaplaning Only', 'Dermaplaning + Peel'],
  'Acne Treatment': ['Acne Consultation', 'Acne Facial', 'Extraction Session', 'LED Treatment'],
  'Anti-Aging': ['Anti-Aging Facial', 'Collagen Boost', 'Microcurrent', 'LED Therapy'],
  // Massage therapist specialties
  'Deep Tissue': ['30 Min Session', '60 Min Session', '90 Min Session', 'Back & Shoulders'],
  'Swedish Massage': ['30 Min Session', '60 Min Session', '90 Min Session', 'Full Body'],
  'Sports Massage': ['30 Min Session', '60 Min Session', '90 Min Session', 'Pre-Event', 'Post-Event'],
  'Hot Stone': ['60 Min Session', '90 Min Session', 'Back Only'],
  'Prenatal Massage': ['30 Min Session', '60 Min Session', 'Postnatal Massage'],
  'Lymphatic Drainage': ['60 Min Session', '90 Min Session', 'Face & Neck'],
}

export function getServicesForSpecialty(specialty: string): string[] {
  return SERVICES_BY_SPECIALTY[specialty] || []
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
