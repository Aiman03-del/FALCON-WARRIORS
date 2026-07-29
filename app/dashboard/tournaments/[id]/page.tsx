import { Suspense } from "react";

import { notFound } from "next/navigation";

import { requireStaff } from "@/app/lib/queries/dashboard";

import { createClient } from "@/app/lib/supabase/client";

import BackLink from "@/app/components/BackLink";

import InternalTournamentDashboard from "@/app/components/dashboard/InternalTournamentDashboard";

import type { InternalTournamentTab } from "@/app/components/dashboard/InternalTournamentTabs";

import OfficialTournamentDashboard from "@/app/components/dashboard/OfficialTournamentDashboard";

import type { OfficialTournamentTab } from "@/app/components/dashboard/OfficialTournamentTabs";

import TournamentStatusControl from "@/app/dashboard/TournamentStatusControl";



function parseInternalTab(tabParam: string | undefined): InternalTournamentTab {

  if (tabParam === "fixtures") return "fixtures";

  if (tabParam === "bracket") return "bracket";

  if (tabParam === "participants") return "participants";

  if (tabParam === "edit") return "edit";

  return "standings";

}



function parseOfficialTab(tabParam: string | undefined): OfficialTournamentTab {

  if (tabParam === "participants") return "participants";

  if (tabParam === "edit") return "edit";

  return "rounds";

}



export default async function TournamentDetailDashboardPage({

  params,

  searchParams,

}: {

  params: Promise<{ id: string }>;

  searchParams: Promise<{ tab?: string }>;

}) {

  await requireStaff();

  const { id } = await params;

  const { tab: tabParam } = await searchParams;

  const supabase = await createClient();



  const { data: tournament } = await supabase

    .from("tournaments")

    .select(

      "id, name, type, format, status, start_date, end_date, max_participants, registration_deadline"

    )

    .eq("id", id)

    .single();



  if (!tournament) notFound();



  const isOfficial = tournament.type === "official";



  return (

    <div>

      <BackLink href="/dashboard/tournaments" label="Back to Tournaments" />



      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>

          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">

            {tournament.name}

          </h1>

          <p className="mt-1 text-sm capitalize text-muted">

            {tournament.type} · {isOfficial ? "external" : tournament.format} · {tournament.status}

          </p>

        </div>



        <TournamentStatusControl tournamentId={tournament.id} currentStatus={tournament.status} />

      </div>



      <div className="mt-8">

        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>

          {isOfficial ? (

            <OfficialTournamentDashboard

              tournamentId={id}

              activeTab={parseOfficialTab(tabParam)}

            />

          ) : (

            <InternalTournamentDashboard

              tournamentId={id}

              activeTab={parseInternalTab(tabParam)}

            />

          )}

        </Suspense>

      </div>

    </div>

  );

}


