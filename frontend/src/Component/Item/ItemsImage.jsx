import React from "react";
import { Avatar } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

export const imageCache = {};

const ItemImage = ({ itemId }) => {
  const { data: imgSrc } = useQuery({
    queryKey: ["itemPicture", itemId],

    queryFn: async () => {
      if (imageCache[itemId]) {
        return imageCache[itemId];
      }

      const response = await api.get(`/Item/${itemId}/picture`, {
        responseType: "blob",
      });

      if (response.data) {
        const url = URL.createObjectURL(response.data);

        imageCache[itemId] = url;

        return url;
      }

      return null;
    },

    enabled: !!itemId,

    staleTime: 5 * 60 * 1000,

    gcTime: 10 * 60 * 1000,
  });

  return (
    <Avatar
      src={imgSrc || undefined}
      variant="rounded"
      sx={{
        width: 45,
        height: 45,
        borderRadius: "5px",
        bgcolor: "#f5f5f5",
      }}
    >
      <ImageIcon
        sx={{
          fontSize: "20px",
          color: "#bdbdbd",
        }}
      />
    </Avatar>
  );
};

export default React.memo(ItemImage);