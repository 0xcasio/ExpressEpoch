import * as React from "react";
import { ResponsiveContainer } from "recharts";

const ChartContainer = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent }; 