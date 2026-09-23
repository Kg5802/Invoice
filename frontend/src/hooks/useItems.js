import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useItems = () => {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await api.get("/Item/GetList");
      return response.data.map((item) => ({
        ...item,
        id: item._id || item.itemId || item.primaryKey,
      }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newItem) => {
      const response = await api.post("/Item", newItem);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item added successfully!");
    },
    onError: (err) => {
      const errorMessage = err.response?.data || "Failed to add item.";
      toast.error(errorMessage);
    },
  });


  const editMutation = useMutation({
    mutationFn: async (updatedItem) => {
      const response = await api.put(
        `/Item/${updatedItem.itemId}`,
        updatedItem,
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item updated successfully!");
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/Item/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted!");
    },
    onError: (err) =>
      toast.error(err.response?.data || "Could not delete item."),
  });

  const updatePictureMutation = useMutation({
    mutationFn: async ({ itemId, file }) => {
      const formData = new FormData();

      formData.append("file", file);

      const response = await api.put(`/Item/${itemId}/picture`, formData);

      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      queryClient.invalidateQueries({
        queryKey: ["itemPicture", variables.itemId],
      });
    },

    onError: (error) => {
      console.error("Picture upload error:", error.response?.data || error);
    },
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,

    addItem: addMutation.mutate,
    isAdding: addMutation.isPending,
    addItemAsync: addMutation.mutateAsync,

    updateItem: editMutation.mutateAsync,
    isUpdating: editMutation.isPending,

    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    updatePicture: updatePictureMutation.mutate,
    updatePictureAsync: updatePictureMutation.mutateAsync,
  };
};
