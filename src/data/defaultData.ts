import { ExpenseCategory, ExpenseSubcategory, MaintenanceType, User, Vehicle } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    userId: 'user_main',
    name: 'Primary Account',
    email: 'user@example.com',
    phone: '',
    profileImage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { categoryId: 'cat_fuel', name: 'Fuel', icon: 'Fuel', description: 'Petrol, diesel, CNG, charging and fuel additives', isActive: true, sortOrder: 1 },
  { categoryId: 'cat_engine_fluids', name: 'Engine & Fluids', icon: 'Droplets', description: 'Engine oil, coolant, transmission and brake fluids', isActive: true, sortOrder: 2 },
  { categoryId: 'cat_periodic_service', name: 'Periodic Service', icon: 'Wrench', description: 'Minor, major, scheduled and preventive maintenance', isActive: true, sortOrder: 3 },
  { categoryId: 'cat_tyres_wheels', name: 'Tyres & Wheels', icon: 'Disc', description: 'Tyre purchase, alignment, balancing and repairs', isActive: true, sortOrder: 4 },
  { categoryId: 'cat_brakes', name: 'Brakes', icon: 'OctagonAlert', description: 'Brake pads, rotors, calipers and adjustment', isActive: true, sortOrder: 5 },
  { categoryId: 'cat_battery_electrical', name: 'Battery & Electrical', icon: 'Zap', description: 'Battery, alternator, starter motor and wiring', isActive: true, sortOrder: 6 },
  { categoryId: 'cat_engine_transmission', name: 'Engine & Transmission', icon: 'Cog', description: 'Engine overhaul, clutch, gearbox and spark plugs', isActive: true, sortOrder: 7 },
  { categoryId: 'cat_ac_cooling', name: 'AC & Cooling', icon: 'Fan', description: 'AC gas, compressor, radiator and thermostat', isActive: true, sortOrder: 8 },
  { categoryId: 'cat_suspension_steering', name: 'Suspension & Steering', icon: 'Compass', description: 'Shock absorbers, struts, tie rods and steering rack', isActive: true, sortOrder: 9 },
  { categoryId: 'cat_spare_parts', name: 'Spare Parts', icon: 'Boxes', description: 'OEM & aftermarket parts, filters, belts and fasteners', isActive: true, sortOrder: 10 },
  { categoryId: 'cat_body_exterior', name: 'Body & Exterior', icon: 'ShieldAlert', description: 'Dents, paint, windshield, mirrors and wipers', isActive: true, sortOrder: 11 },
  { categoryId: 'cat_cleaning_appearance', name: 'Cleaning & Appearance', icon: 'Sparkles', description: 'Washing, detailing, waxing and ceramic coating', isActive: true, sortOrder: 12 },
  { categoryId: 'cat_parking_toll', name: 'Parking & Toll', icon: 'ParkingSquare', description: 'Parking fees, expressway toll, FASTag & permits', isActive: true, sortOrder: 13 },
  { categoryId: 'cat_insurance_legal', name: 'Insurance & Legal', icon: 'FileText', description: 'Vehicle insurance, PUC test, road taxes and permits', isActive: true, sortOrder: 14 },
  { categoryId: 'cat_fines_penalties', name: 'Fines & Penalties', icon: 'AlertTriangle', description: 'Traffic tickets, parking citations and fines', isActive: true, sortOrder: 15 },
  { categoryId: 'cat_labour_workshop', name: 'Labour & Workshop', icon: 'Hammer', description: 'Mechanic labor, diagnostics, towing and recovery', isActive: true, sortOrder: 16 },
  { categoryId: 'cat_breakdown_emergency', name: 'Breakdown & Emergency', icon: 'Siren', description: 'Emergency repairs, jump starts and roadside assistance', isActive: true, sortOrder: 17 },
  { categoryId: 'cat_accessories_tech', name: 'Accessories & Technology', icon: 'Cpu', description: 'Dashcams, GPS tracking, audio and chargers', isActive: true, sortOrder: 18 },
  { categoryId: 'cat_interior', name: 'Interior', icon: 'Armchair', description: 'Seat covers, floor mats, upholstery and dashboard', isActive: true, sortOrder: 19 },
  { categoryId: 'cat_other', name: 'Other', icon: 'FolderPlus', description: 'Miscellaneous, consumables and other vehicle expenses', isActive: true, sortOrder: 20 },
];

export const DEFAULT_SUBCATEGORIES: ExpenseSubcategory[] = [
  // 1. Fuel
  { subcategoryId: 'sub_fuel_petrol', categoryId: 'cat_fuel', name: 'Petrol', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_fuel_diesel', categoryId: 'cat_fuel', name: 'Diesel', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_fuel_cng', categoryId: 'cat_fuel', name: 'CNG', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_fuel_lpg', categoryId: 'cat_fuel', name: 'LPG', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_fuel_ev', categoryId: 'cat_fuel', name: 'EV Charging', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_fuel_additives', categoryId: 'cat_fuel', name: 'Fuel Additives', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_fuel_emergency', categoryId: 'cat_fuel', name: 'Emergency Fuel', isActive: true, sortOrder: 7 },

  // 2. Engine & Fluids
  { subcategoryId: 'sub_fluid_engine_oil', categoryId: 'cat_engine_fluids', name: 'Engine Oil', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_fluid_oil_filter', categoryId: 'cat_engine_fluids', name: 'Oil Filter', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_fluid_coolant', categoryId: 'cat_engine_fluids', name: 'Coolant', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_fluid_brake_fluid', categoryId: 'cat_engine_fluids', name: 'Brake Fluid', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_fluid_transmission_oil', categoryId: 'cat_engine_fluids', name: 'Transmission Oil', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_fluid_gear_oil', categoryId: 'cat_engine_fluids', name: 'Gear Oil', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_fluid_diff_oil', categoryId: 'cat_engine_fluids', name: 'Differential Oil', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_fluid_power_steering', categoryId: 'cat_engine_fluids', name: 'Power Steering Fluid', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_fluid_grease', categoryId: 'cat_engine_fluids', name: 'Grease', isActive: true, sortOrder: 9 },
  { subcategoryId: 'sub_fluid_other', categoryId: 'cat_engine_fluids', name: 'Other Fluids', isActive: true, sortOrder: 10 },

  // 3. Periodic Service
  { subcategoryId: 'sub_serv_general', categoryId: 'cat_periodic_service', name: 'General Service', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_serv_minor', categoryId: 'cat_periodic_service', name: 'Minor Service', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_serv_major', categoryId: 'cat_periodic_service', name: 'Major Service', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_serv_scheduled', categoryId: 'cat_periodic_service', name: 'Scheduled Service', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_serv_preventive', categoryId: 'cat_periodic_service', name: 'Preventive Maintenance', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_serv_inspection', categoryId: 'cat_periodic_service', name: 'Inspection', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_serv_labour', categoryId: 'cat_periodic_service', name: 'Service Labour', isActive: true, sortOrder: 7 },

  // 4. Tyres & Wheels
  { subcategoryId: 'sub_tyre_purchase', categoryId: 'cat_tyres_wheels', name: 'Tyre Purchase', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_tyre_repair', categoryId: 'cat_tyres_wheels', name: 'Tyre Repair', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_tyre_puncture', categoryId: 'cat_tyres_wheels', name: 'Puncture Repair', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_tyre_align', categoryId: 'cat_tyres_wheels', name: 'Wheel Alignment', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_tyre_balance', categoryId: 'cat_tyres_wheels', name: 'Wheel Balancing', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_tyre_rotation', categoryId: 'cat_tyres_wheels', name: 'Tyre Rotation', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_tyre_rim', categoryId: 'cat_tyres_wheels', name: 'Rim Repair', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_tyre_valve', categoryId: 'cat_tyres_wheels', name: 'Valve Replacement', isActive: true, sortOrder: 8 },

  // 5. Brakes
  { subcategoryId: 'sub_brake_pad', categoryId: 'cat_brakes', name: 'Brake Pad', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_brake_shoe', categoryId: 'cat_brakes', name: 'Brake Shoe', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_brake_rotor', categoryId: 'cat_brakes', name: 'Brake Disc/Rotor', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_brake_drum', categoryId: 'cat_brakes', name: 'Brake Drum', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_brake_caliper', categoryId: 'cat_brakes', name: 'Brake Caliper', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_brake_fluid', categoryId: 'cat_brakes', name: 'Brake Fluid', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_brake_line', categoryId: 'cat_brakes', name: 'Brake Line', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_brake_adjust', categoryId: 'cat_brakes', name: 'Brake Adjustment', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_brake_labour', categoryId: 'cat_brakes', name: 'Brake Labour', isActive: true, sortOrder: 9 },

  // 6. Battery & Electrical
  { subcategoryId: 'sub_elec_battery_buy', categoryId: 'cat_battery_electrical', name: 'Battery Purchase', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_elec_battery_rep', categoryId: 'cat_battery_electrical', name: 'Battery Replacement', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_elec_battery_chg', categoryId: 'cat_battery_electrical', name: 'Battery Charging', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_elec_alternator', categoryId: 'cat_battery_electrical', name: 'Alternator', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_elec_starter', categoryId: 'cat_battery_electrical', name: 'Starter Motor', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_elec_fuse', categoryId: 'cat_battery_electrical', name: 'Fuse', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_elec_lighting', categoryId: 'cat_battery_electrical', name: 'Bulb/Lighting', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_elec_wiring', categoryId: 'cat_battery_electrical', name: 'Wiring', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_elec_diag', categoryId: 'cat_battery_electrical', name: 'Electrical Diagnosis', isActive: true, sortOrder: 9 },

  // 7. Engine & Transmission
  { subcategoryId: 'sub_trans_repair', categoryId: 'cat_engine_transmission', name: 'Engine Repair', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_trans_parts', categoryId: 'cat_engine_transmission', name: 'Engine Parts', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_trans_clutch', categoryId: 'cat_engine_transmission', name: 'Clutch', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_trans_gearbox', categoryId: 'cat_engine_transmission', name: 'Gearbox', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_trans_timing', categoryId: 'cat_engine_transmission', name: 'Timing Belt/Chain', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_trans_spark', categoryId: 'cat_engine_transmission', name: 'Spark Plug', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_trans_glow', categoryId: 'cat_engine_transmission', name: 'Glow Plug', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_trans_injector', categoryId: 'cat_engine_transmission', name: 'Injector', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_trans_pump', categoryId: 'cat_engine_transmission', name: 'Fuel Pump', isActive: true, sortOrder: 9 },
  { subcategoryId: 'sub_trans_exhaust', categoryId: 'cat_engine_transmission', name: 'Exhaust', isActive: true, sortOrder: 10 },

  // 8. AC & Cooling
  { subcategoryId: 'sub_ac_service', categoryId: 'cat_ac_cooling', name: 'AC Service', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_ac_gas', categoryId: 'cat_ac_cooling', name: 'AC Gas', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_ac_compressor', categoryId: 'cat_ac_cooling', name: 'AC Compressor', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_ac_filter', categoryId: 'cat_ac_cooling', name: 'AC Filter', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_ac_condenser', categoryId: 'cat_ac_cooling', name: 'Condenser', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_ac_radiator', categoryId: 'cat_ac_cooling', name: 'Radiator', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_ac_thermostat', categoryId: 'cat_ac_cooling', name: 'Thermostat', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_ac_waterpump', categoryId: 'cat_ac_cooling', name: 'Water Pump', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_ac_fan', categoryId: 'cat_ac_cooling', name: 'Cooling Fan', isActive: true, sortOrder: 9 },

  // 9. Suspension & Steering
  { subcategoryId: 'sub_susp_shock', categoryId: 'cat_suspension_steering', name: 'Shock Absorber', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_susp_strut', categoryId: 'cat_suspension_steering', name: 'Strut', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_susp_spring', categoryId: 'cat_suspension_steering', name: 'Spring', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_susp_control_arm', categoryId: 'cat_suspension_steering', name: 'Control Arm', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_susp_ball_joint', categoryId: 'cat_suspension_steering', name: 'Ball Joint', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_susp_tie_rod', categoryId: 'cat_suspension_steering', name: 'Tie Rod', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_susp_rack', categoryId: 'cat_suspension_steering', name: 'Steering Rack', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_susp_bearing', categoryId: 'cat_suspension_steering', name: 'Wheel Bearing', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_susp_bush', categoryId: 'cat_suspension_steering', name: 'Bush', isActive: true, sortOrder: 9 },

  // 10. Spare Parts
  { subcategoryId: 'sub_parts_oem', categoryId: 'cat_spare_parts', name: 'OEM Parts', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_parts_aftermarket', categoryId: 'cat_spare_parts', name: 'Aftermarket Parts', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_parts_filters', categoryId: 'cat_spare_parts', name: 'Filters', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_parts_belts', categoryId: 'cat_spare_parts', name: 'Belts', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_parts_hoses', categoryId: 'cat_spare_parts', name: 'Hoses', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_parts_bearings', categoryId: 'cat_spare_parts', name: 'Bearings', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_parts_fasteners', categoryId: 'cat_spare_parts', name: 'Nuts/Bolts', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_parts_clips', categoryId: 'cat_spare_parts', name: 'Clips/Fasteners', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_parts_other', categoryId: 'cat_spare_parts', name: 'Other Parts', isActive: true, sortOrder: 9 },

  // 11. Body & Exterior
  { subcategoryId: 'sub_body_dent', categoryId: 'cat_body_exterior', name: 'Dent Repair', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_body_paint', categoryId: 'cat_body_exterior', name: 'Painting', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_body_bumper', categoryId: 'cat_body_exterior', name: 'Bumper', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_body_glass', categoryId: 'cat_body_exterior', name: 'Windshield/Glass', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_body_mirror', categoryId: 'cat_body_exterior', name: 'Mirror', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_body_door', categoryId: 'cat_body_exterior', name: 'Door Repair', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_body_wiper_blade', categoryId: 'cat_body_exterior', name: 'Wiper Blade', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_body_wiper_motor', categoryId: 'cat_body_exterior', name: 'Wiper Motor', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_body_plate', categoryId: 'cat_body_exterior', name: 'Number Plate', isActive: true, sortOrder: 9 },
  { subcategoryId: 'sub_body_parts', categoryId: 'cat_body_exterior', name: 'Body Parts', isActive: true, sortOrder: 10 },

  // 12. Cleaning & Appearance
  { subcategoryId: 'sub_clean_wash', categoryId: 'cat_cleaning_appearance', name: 'Vehicle Wash', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_clean_interior', categoryId: 'cat_cleaning_appearance', name: 'Interior Cleaning', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_clean_exterior', categoryId: 'cat_cleaning_appearance', name: 'Exterior Cleaning', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_clean_detailing', categoryId: 'cat_cleaning_appearance', name: 'Detailing', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_clean_polishing', categoryId: 'cat_cleaning_appearance', name: 'Polishing', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_clean_waxing', categoryId: 'cat_cleaning_appearance', name: 'Waxing', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_clean_ceramic', categoryId: 'cat_cleaning_appearance', name: 'Ceramic Coating', isActive: true, sortOrder: 7 },

  // 13. Parking & Toll
  { subcategoryId: 'sub_park_fee', categoryId: 'cat_parking_toll', name: 'Parking Fee', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_park_toll', categoryId: 'cat_parking_toll', name: 'Toll Fee', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_park_fastag', categoryId: 'cat_parking_toll', name: 'FASTag Recharge', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_park_entry', categoryId: 'cat_parking_toll', name: 'Entry Fee', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_park_valet', categoryId: 'cat_parking_toll', name: 'Valet Parking', isActive: true, sortOrder: 5 },

  // 14. Insurance & Legal
  { subcategoryId: 'sub_ins_insurance', categoryId: 'cat_insurance_legal', name: 'Vehicle Insurance', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_ins_renewal', categoryId: 'cat_insurance_legal', name: 'Insurance Renewal', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_ins_road_tax', categoryId: 'cat_insurance_legal', name: 'Road Tax', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_ins_registration', categoryId: 'cat_insurance_legal', name: 'Registration', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_ins_puc', categoryId: 'cat_insurance_legal', name: 'PUC/Emission Test', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_ins_permit', categoryId: 'cat_insurance_legal', name: 'Permit', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_ins_fitness', categoryId: 'cat_insurance_legal', name: 'Fitness Certificate', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_ins_documentation', categoryId: 'cat_insurance_legal', name: 'Documentation', isActive: true, sortOrder: 8 },

  // 15. Fines & Penalties
  { subcategoryId: 'sub_fine_traffic', categoryId: 'cat_fines_penalties', name: 'Traffic Fine', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_fine_parking', categoryId: 'cat_fines_penalties', name: 'Parking Fine', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_fine_overloading', categoryId: 'cat_fines_penalties', name: 'Overloading Fine', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_fine_penalty', categoryId: 'cat_fines_penalties', name: 'Government Penalty', isActive: true, sortOrder: 4 },

  // 16. Labour & Workshop
  { subcategoryId: 'sub_lab_mechanic', categoryId: 'cat_labour_workshop', name: 'Mechanic Labour', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_lab_electrical', categoryId: 'cat_labour_workshop', name: 'Electrical Labour', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_lab_body', categoryId: 'cat_labour_workshop', name: 'Body Labour', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_lab_ac', categoryId: 'cat_labour_workshop', name: 'AC Labour', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_lab_tyre', categoryId: 'cat_labour_workshop', name: 'Tyre Labour', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_lab_towing', categoryId: 'cat_labour_workshop', name: 'Towing', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_lab_roadside', categoryId: 'cat_labour_workshop', name: 'Roadside Assistance', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_lab_diagnostic', categoryId: 'cat_labour_workshop', name: 'Diagnostic Charges', isActive: true, sortOrder: 8 },

  // 17. Breakdown & Emergency
  { subcategoryId: 'sub_emer_towing', categoryId: 'cat_breakdown_emergency', name: 'Towing', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_emer_jumpstart', categoryId: 'cat_breakdown_emergency', name: 'Jump Start', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_emer_repair', categoryId: 'cat_breakdown_emergency', name: 'Emergency Repair', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_emer_roadside', categoryId: 'cat_breakdown_emergency', name: 'Roadside Assistance', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_emer_recovery', categoryId: 'cat_breakdown_emergency', name: 'Recovery Charges', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_emer_parts', categoryId: 'cat_breakdown_emergency', name: 'Emergency Parts', isActive: true, sortOrder: 6 },

  // 18. Accessories & Technology
  { subcategoryId: 'sub_tech_dashcam', categoryId: 'cat_accessories_tech', name: 'Dashcam', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_tech_gps', categoryId: 'cat_accessories_tech', name: 'GPS', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_tech_holder', categoryId: 'cat_accessories_tech', name: 'Phone Holder', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_tech_charger', categoryId: 'cat_accessories_tech', name: 'Charger', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_tech_audio', categoryId: 'cat_accessories_tech', name: 'Audio System', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_tech_speakers', categoryId: 'cat_accessories_tech', name: 'Speakers', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_tech_security', categoryId: 'cat_accessories_tech', name: 'Security System', isActive: true, sortOrder: 7 },
  { subcategoryId: 'sub_tech_tracking', categoryId: 'cat_accessories_tech', name: 'Tracking Device', isActive: true, sortOrder: 8 },
  { subcategoryId: 'sub_tech_other', categoryId: 'cat_accessories_tech', name: 'Other Accessories', isActive: true, sortOrder: 9 },

  // 19. Interior
  { subcategoryId: 'sub_int_seat_cover', categoryId: 'cat_interior', name: 'Seat Cover', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_int_floor_mat', categoryId: 'cat_interior', name: 'Floor Mat', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_int_dashboard', categoryId: 'cat_interior', name: 'Dashboard Repair', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_int_parts', categoryId: 'cat_interior', name: 'Interior Parts', isActive: true, sortOrder: 4 },
  { subcategoryId: 'sub_int_upholstery', categoryId: 'cat_interior', name: 'Upholstery', isActive: true, sortOrder: 5 },
  { subcategoryId: 'sub_int_cabin_filter', categoryId: 'cat_interior', name: 'Cabin Filter', isActive: true, sortOrder: 6 },
  { subcategoryId: 'sub_int_accessories', categoryId: 'cat_interior', name: 'Interior Accessories', isActive: true, sortOrder: 7 },

  // 20. Other
  { subcategoryId: 'sub_oth_misc', categoryId: 'cat_other', name: 'Miscellaneous', isActive: true, sortOrder: 1 },
  { subcategoryId: 'sub_oth_tools', categoryId: 'cat_other', name: 'Tools', isActive: true, sortOrder: 2 },
  { subcategoryId: 'sub_oth_consumables', categoryId: 'cat_other', name: 'Consumables', isActive: true, sortOrder: 3 },
  { subcategoryId: 'sub_oth_expense', categoryId: 'cat_other', name: 'Other Vehicle Expense', isActive: true, sortOrder: 4 },
];

export const DEFAULT_MAINTENANCE_TYPES: MaintenanceType[] = [
  { maintenanceTypeId: 'maint_oil_change', name: 'Engine Oil Change', description: 'Replace motor oil and seal rings', icon: 'Droplet', isActive: true, sortOrder: 1 },
  { maintenanceTypeId: 'maint_oil_filter', name: 'Oil Filter', description: 'Replace spin-on or cartridge oil filter', icon: 'Filter', isActive: true, sortOrder: 2 },
  { maintenanceTypeId: 'maint_air_filter', name: 'Air Filter', description: 'Engine intake air filter inspection and replacement', icon: 'Wind', isActive: true, sortOrder: 3 },
  { maintenanceTypeId: 'maint_brake_service', name: 'Brake Service', description: 'Complete brake disc/drum service and fluid check', icon: 'CircleDot', isActive: true, sortOrder: 4 },
  { maintenanceTypeId: 'maint_brake_pads', name: 'Brake Pad Replacement', description: 'Front/rear friction brake pads replacement', icon: 'Layers', isActive: true, sortOrder: 5 },
  { maintenanceTypeId: 'maint_tyre_replace', name: 'Tyre Replacement', description: 'Tread wear replacement and balancing', icon: 'Disc', isActive: true, sortOrder: 6 },
  { maintenanceTypeId: 'maint_battery_replace', name: 'Battery Replacement', description: '12V starter battery or EV aux battery renewal', icon: 'Zap', isActive: true, sortOrder: 7 },
  { maintenanceTypeId: 'maint_general_service', name: 'General Service', description: 'Multipoint inspection and tune-up', icon: 'Wrench', isActive: true, sortOrder: 8 },
  { maintenanceTypeId: 'maint_major_service', name: 'Major Service', description: 'Comprehensive overhaul, belts, plugs and fluid flush', icon: 'Settings', isActive: true, sortOrder: 9 },
  { maintenanceTypeId: 'maint_ac_service', name: 'AC Service', description: 'Refrigerant recharge and condenser coil cleansing', icon: 'Fan', isActive: true, sortOrder: 10 },
  { maintenanceTypeId: 'maint_coolant_replace', name: 'Coolant Replacement', description: 'Radiator flush and anti-freeze replenishment', icon: 'Thermometer', isActive: true, sortOrder: 11 },
  { maintenanceTypeId: 'maint_gear_oil', name: 'Gear Oil', description: 'Manual transmission or transfer box gear lubricant', icon: 'Cog', isActive: true, sortOrder: 12 },
  { maintenanceTypeId: 'maint_trans_service', name: 'Transmission Service', description: 'Automatic transmission fluid flush and pan gasket', icon: 'Gauge', isActive: true, sortOrder: 13 },
  { maintenanceTypeId: 'maint_wheel_align', name: 'Wheel Alignment', description: 'Camber, caster, and toe 3D laser alignment', icon: 'Crosshair', isActive: true, sortOrder: 14 },
  { maintenanceTypeId: 'maint_wheel_balance', name: 'Wheel Balancing', description: 'High-speed dynamic rim weight counterbalancing', icon: 'Compass', isActive: true, sortOrder: 15 },
  { maintenanceTypeId: 'maint_insurance_renewal', name: 'Insurance Renewal', description: 'Annual comprehensive policy renewal', icon: 'ShieldCheck', isActive: true, sortOrder: 16 },
  { maintenanceTypeId: 'maint_puc_renewal', name: 'PUC Renewal', description: 'Statutory smoke emission and pollution test', icon: 'FileCheck', isActive: true, sortOrder: 17 },
  { maintenanceTypeId: 'maint_road_tax', name: 'Road Tax', description: 'Municipal / State road tax token renewal', icon: 'CreditCard', isActive: true, sortOrder: 18 },
  { maintenanceTypeId: 'maint_custom', name: 'Custom Maintenance', description: 'Custom vehicle maintenance requirement', icon: 'Sliders', isActive: true, sortOrder: 19 },
];

export const INITIAL_VEHICLES: Vehicle[] = [];
