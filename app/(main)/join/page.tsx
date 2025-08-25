"use client"

import Container from "@/components/common/container";
import Header from "@/components/common/header";
import Table from "@/components/common/table/table";
import { fetchInvites } from "@/lib/data/fetch-invites";
import { ActionEnum, EmptyAction } from "@/lib/types/Action";
import { ColumnEnum } from "@/lib/types/Column";
import { Invite } from "@/lib/types/Invite";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { orgSlice } from "@/lib/store/slices/orgSlice";
import { NULL_ORG } from "@/lib/constants";

export default function Join() {
    const [invites, setInvites] = useState<Invite[]>([])
    const orgName = useAppSelector(orgSlice.selectors.selectName)

    useEffect(() => {
        const getInvites = async () => {
            try {
                const invites = await fetchInvites()
                setInvites(invites)
            } catch (error) {
                // If there's an error fetching invites (e.g., user not authenticated), set empty array
                setInvites([])
            }
        }
        getInvites()
    }, [])

    const columns = [
        {type: ColumnEnum.Organization, label: "Organization"}, 
        {type: ColumnEnum.User, label: "Invited By"}, 
        {type: ColumnEnum.LastActive, label: "Invited At"},
        {type: ColumnEnum.Actions, actions: [{type: ActionEnum.JOIN, label: "Join"}, {type: ActionEnum.DECLINE, label: "Decline"}] as EmptyAction[]}
    ]

    return (
        <Container>
    
          <div className="xl:flex">
    
            {/* Left + Middle content */}
            <div className="md:flex flex-1">

                {/*Left Content*/}
    
                {/* Middle content */}
                <div className="flex-1 md:ml-8 xl:mx-4 2xl:mx-8">
                <div className="md:py-4">
    
                    {/* Blocks */}
                    <div className="space-y-4">
    
                    {/*Start*/}
                    {
                        orgName && orgName !== NULL_ORG ? (
                            <Header text="You are already a member of a team." description={orgName ?? ''}/>  
                        ) : orgName === null ? (
                            <Header text="Welcome to LeafyLab Predictor" description="Sign in to access team features or explore the platform as a guest."/>
                        ) : (
                            <Header text="You are not a member of any team." description="Join a team to get started."/>
                        )
                    }
                  
                    {/*End*/}
                    {
                        invites.length > 0 ? (
                            <Table columns={columns} rows={invites}/>
                        ) : (
                            <div className="text-center text-gray-500">
                                {orgName === null ? "Sign in to view your team invitations." : "No invites found."}
                            </div>
                        )
                    }
                    
                    </div>
    
                </div>
                </div>
                
            </div>
          </div>
        </Container>
    )
}