"use client";

import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

interface SearchProps {
  options: SelectProps["options"];
  value: string[];
  onChange: (value: string[]) => void;
}

const Search: React.FC<SearchProps> = ({ options, value, onChange }) => {
  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: "100%" }}
      placeholder="Filter by difficulty or topic"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
};

export default Search;