"use client";

import { Button, type ButtonProps, type PolymorphicComponentProps } from "@mantine/core";

export type AppButtonVariant = "primary" | "gold" | "outline" | "ghost" | "danger";

type AppButtonOwnProps = Omit<ButtonProps, "variant" | "color"> & {
  variant?: AppButtonVariant;
};

export type AppButtonProps<C = "button"> = PolymorphicComponentProps<C, AppButtonOwnProps>;

const VARIANT_MAP: Record<AppButtonVariant, Pick<ButtonProps, "variant" | "color">> = {
  primary: { variant: "filled", color: "brand" },
  gold: { variant: "filled", color: "gold" },
  outline: { variant: "outline", color: "brand" },
  ghost: { variant: "subtle", color: "brand" },
  danger: { variant: "filled", color: "red" },
};

export function AppButton<C = "button">({ variant = "primary", style, ...props }: AppButtonProps<C>) {
  return (
    <Button
      radius="sm"
      fw={600}
      style={{ flexShrink: 0, ...style }}
      {...VARIANT_MAP[variant]}
      {...(props as ButtonProps)}
    />
  );
}
