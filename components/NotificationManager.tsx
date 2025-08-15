"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Settings } from 'lucide-react'
import { requestNotificationPermission, onMessageListener, messaging } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import NotificationPreferences from '@/components/NotificationPreferences'

export default function NotificationManager() {
  // Completely disabled to prevent errors
  console.log('NotificationManager disabled to prevent errors');
  
  return null;
}