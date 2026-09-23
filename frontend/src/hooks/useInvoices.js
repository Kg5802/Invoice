import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../api/axios";
import toast from "react-hot-toast";

export const useInvoices = (fromDate, toDate) => {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ["invoices", fromDate, toDate],

    queryFn: async () => {
      const params = {};

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetList", {
        params,
      });

      const invoices = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      return invoices.map((invoice) => ({
        ...invoice,

        id:
          invoice.primaryKeyID ??
          invoice.primaryKey ??
          invoice._id ??
          invoice.invoiceID,
      }));
    },
  });


  const invoiceMetrics = useQuery({
    queryKey: ["invoiceMetrics", fromDate, toDate],

    queryFn: async () => {
      const params = {};

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/GetMetrices", {
        params,
      });

      return (
        response.data || {
          invoiceCount: 0,
          totalAmount: 0,
        }
      );
    },
  });


  const topItemsQuery = useQuery({
    queryKey: ["topItems", fromDate, toDate],

    queryFn: async () => {
      const params = {
        topN: 5,
      };

      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await api.get("/Invoice/TopItems", {
        params,
      });

      return Array.isArray(response.data) ? response.data : [];
    },
  });

 
  const addMutation = useMutation({
    mutationFn: async (newInvoice) => {
      const response = await api.post("/Invoice", newInvoice);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceMetrics"],
      });

      queryClient.invalidateQueries({
        queryKey: ["topItems"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceChart"],
      });

      toast.success("Invoice created successfully!");
    },

    onError: (error) => {
      console.error("Add Invoice Error:", error.response?.data || error);

      toast.error(error.response?.data?.message || "Failed to create invoice");
    },
  });

  
  const updateMutation = useMutation({
    mutationFn: async (updatedInvoice) => {
      const invoiceID =
        updatedInvoice.invoiceID ??
        updatedInvoice.primaryKeyID ??
        updatedInvoice.id ??
        updatedInvoice._id;

      if (!invoiceID) {
        throw new Error("Invoice ID is missing");
      }

      const response = await api.put(`/Invoice/${invoiceID}`, updatedInvoice);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceMetrics"],
      });

      queryClient.invalidateQueries({
        queryKey: ["topItems"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceChart"],
      });

      toast.success("Invoice updated successfully!");
    },

    onError: (error) => {
      console.error("Update Invoice Error:", error.response?.data || error);

      toast.error(error.response?.data?.message || "Failed to update invoice");
    },
  });


  const deleteMutation = useMutation({
    mutationFn: async (invoiceID) => {
      if (!invoiceID) {
        throw new Error("Invoice ID is missing");
      }

      const response = await api.delete(`/Invoice/${invoiceID}`);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceMetrics"],
      });

      queryClient.invalidateQueries({
        queryKey: ["topItems"],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoiceChart"],
      });

      toast.success("Invoice deleted successfully!");
    },

    onError: (error) => {
      console.error("Delete Invoice Error:", error.response?.data || error);

      toast.error(error.response?.data?.message || "Failed to delete invoice");
    },
  });

  return {
  
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    isFetching: invoicesQuery.isFetching,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,

  
    invoiceMetrics: invoiceMetrics.data || {
      invoiceCount: 0,
      totalAmount: 0,
    },

    isLoadingMetrics: invoiceMetrics.isLoading,
    isErrorMetrics: invoiceMetrics.isError,

    topItems: topItemsQuery.data || [],
    isLoadingTopItems: topItemsQuery.isLoading,
    isErrorTopItems: topItemsQuery.isError,

    addInvoice: addMutation.mutate,
    addInvoiceAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,

    updateInvoice: updateMutation.mutate,
    updateInvoiceAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteInvoice: deleteMutation.mutate,
    deleteInvoiceAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useInvoiceChart = () => {
  const invoiceChart = useQuery({
    queryKey: ["invoiceChart"],

    queryFn: async () => {
      const response = await api.get("/Invoice/GetTrend12m");

      return Array.isArray(response.data) ? response.data : [];
    },

    staleTime: 5 * 60 * 1000,
  });

  return {
    data: invoiceChart.data || [],
    isLoading: invoiceChart.isLoading,
    isFetching: invoiceChart.isFetching,
    isError: invoiceChart.isError,
    error: invoiceChart.error,
  };
};
