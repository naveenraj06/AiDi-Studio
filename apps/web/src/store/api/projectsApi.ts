import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/store/axiosBaseQuery";
import { axiosClient } from "@/lib/axiosClient";
import type { Plan, Project } from "@/types";

export interface CreateProjectInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
  plan?: Plan;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: axiosBaseQuery(axiosClient),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({ url: "/projects" }),
      transformResponse: (response: { projects: Project[] }) => response.projects,
      providesTags: (result) =>
        result
          ? [...result.map((p) => ({ type: "Project" as const, id: p.id })), { type: "Project" as const, id: "LIST" }]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => ({ url: `/projects/${id}` }),
      transformResponse: (response: { project: Project }) => response.project,
      providesTags: (_result, _error, id) => [{ type: "Project", id }],
    }),
    createProject: builder.mutation<Project, CreateProjectInput>({
      query: (input) => ({ url: "/projects", method: "POST", data: input }),
      transformResponse: (response: { project: Project }) => response.project,
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation<Project, UpdateProjectInput>({
      query: ({ id, ...input }) => ({ url: `/projects/${id}`, method: "PATCH", data: input }),
      transformResponse: (response: { project: Project }) => response.project,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Project", id: "LIST" },
        { type: "Project", id },
      ],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Project", id: "LIST" },
        { type: "Project", id },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
