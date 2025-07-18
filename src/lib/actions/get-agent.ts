'use server';

import { mockAgents } from "../mockups/agent-mockup";


export async function getAllAgents() {
  return mockAgents;
}
