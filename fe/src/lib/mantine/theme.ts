import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Bảng màu rút ra từ Figma (yb3y18eMuEPXxw5bLa0vdI) — dự án "UrbanLease"
const brand: MantineColorsTuple = [
  "#f5f2f0",
  "#e8e1dd",
  "#d3c7c1",
  "#bca99f",
  "#a88d82",
  "#8f7267",
  "#3c2f2f",
  "#332727",
  "#2a2020",
  "#211919",
];

const gold: MantineColorsTuple = [
  "#fcf8ed",
  "#f7edd0",
  "#efdca3",
  "#e6cb76",
  "#debc52",
  "#d4af37",
  "#c29a2c",
  "#a17f22",
  "#7f651b",
  "#5e4b14",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, gold },
  fontFamily: "var(--font-sans)",
  fontFamilyMonospace: "monospace",
  headings: {
    fontFamily: "var(--font-heading)",
    fontWeight: "700",
  },
  defaultRadius: "sm",
  radius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
    Input: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
});
