'use client'

import { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/lib/actions/supabase-actions/get-user-profile";

type CanSeeItProps = {
    children: ReactNode
}

export function CanSeeIt({ children }: CanSeeItProps){

    const queryClient = useQueryClient();

    const profile = queryClient.getQueryData<UserProfile>(['profiles'])
    console.log({profile})

    const isAgent = profile?.role == 'agent'
    if(isAgent) return children

    return(
        <></>    
    )
}

