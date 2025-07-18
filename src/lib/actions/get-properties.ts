// lib/actions/get-mock-properties.ts
'use server';

import { PropertyResponse } from '@/lib/types/property';
import { mockProperties } from '../mockups/properties-mockup';

export async function getMockProperties(): Promise<PropertyResponse[]> {
  return mockProperties;
}
