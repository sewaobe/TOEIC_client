import axiosClient from "./axiosClient";
import {
  ReportItem,
  ReportListResponse,
  ReportStatus,
  ReportType,
} from "../types/Report";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

export interface CreateReportPayload {
  type: ReportType;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  type?: ReportType | "all";
  status?: ReportStatus | "all";
  search?: string;
}

export const reportService = {
  async createReport(payload: CreateReportPayload): Promise<ReportItem> {
    const res = await axiosClient.post<ApiResponse<ReportItem>>(
      "/reports",
      payload
    );
    return res.data;
  },

  async getMyReports(
    params: ReportQueryParams = {}
  ): Promise<ReportListResponse> {
    const res = await axiosClient.get<ApiResponse<ReportListResponse>>(
      "/reports",
      {
        params: {
          page: params.page,
          limit: params.limit,
          type: params.type && params.type !== "all" ? params.type : undefined,
          status:
            params.status && params.status !== "all"
              ? params.status
              : undefined,
          search: params.search,
        },
      }
    );

    return res.data;
  },

  async getReportDetail(id: string): Promise<ReportItem> {
    const res = await axiosClient.get<ApiResponse<ReportItem>>(
      `/reports/${id}`
    );
    return res.data;
  },
};
