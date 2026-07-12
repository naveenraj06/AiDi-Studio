import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { ProjectRole, TeamMember } from "@/types";

export interface InviteMemberInput {
  name: string;
  email: string;
  role?: "editor" | "viewer";
}

export const teamApi = createApi({
  reducerPath: "teamApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["TeamMember"],
  endpoints: (builder) => ({
    getTeam: builder.query<TeamMember[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/team` }),
      transformResponse: (response: { team: TeamMember[] }) => response.team,
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map((m) => ({ type: "TeamMember" as const, id: m.id })),
              { type: "TeamMember" as const, id: `LIST-${projectId}` },
            ]
          : [{ type: "TeamMember" as const, id: `LIST-${projectId}` }],
    }),
    inviteMember: builder.mutation<TeamMember, { projectId: string; input: InviteMemberInput }>({
      query: ({ projectId, input }) => ({ url: `/projects/${projectId}/team`, method: "POST", data: input }),
      transformResponse: (response: { member: TeamMember }) => response.member,
      invalidatesTags: (_result, _error, { projectId }) => [{ type: "TeamMember", id: `LIST-${projectId}` }],
    }),
    updateMemberRole: builder.mutation<TeamMember, { projectId: string; id: string; role: ProjectRole }>({
      query: ({ projectId, id, role }) => ({
        url: `/projects/${projectId}/team/${id}`,
        method: "PATCH",
        data: { role },
      }),
      transformResponse: (response: { member: TeamMember }) => response.member,
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "TeamMember", id: `LIST-${projectId}` },
        { type: "TeamMember", id },
      ],
    }),
    removeMember: builder.mutation<void, { projectId: string; id: string }>({
      query: ({ projectId, id }) => ({ url: `/projects/${projectId}/team/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { projectId, id }) => [
        { type: "TeamMember", id: `LIST-${projectId}` },
        { type: "TeamMember", id },
      ],
    }),
  }),
});

export const { useGetTeamQuery, useInviteMemberMutation, useUpdateMemberRoleMutation, useRemoveMemberMutation } =
  teamApi;
