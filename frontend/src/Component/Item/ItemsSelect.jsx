import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useItems } from "../../hooks/useItems";

const ItemSelect = ({
  value,
  onChange,
  error,
  helperText,
  size = "small",
}) => {
  const { items = [], isLoading } = useItems();

  return (
    <Autocomplete
      size={size}
      options={items}
      loading={isLoading}
      value={value || null}
      onChange={onChange}
      getOptionLabel={(option) => option?.itemName || ""}
      isOptionEqualToValue={(option, val) =>
        option?.itemId === val?.itemId
      }
      loadingText="Loading items..."
      noOptionsText="No items found"
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select item..."
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
};

export default ItemSelect;