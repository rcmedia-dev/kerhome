// lib/logout.ts
'use client'

export function logout() {
  localStorage.removeItem('kerhome_user');
}
